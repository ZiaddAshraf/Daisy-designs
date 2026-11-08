import assert from "node:assert/strict";
import test from "node:test";
import {
  PaymobClient,
  calculatePaymobHmac,
  verifyPaymobHmac,
} from "../src/lib/paymob";
import type { PaymobTransactionObject } from "../src/lib/paymob/types";

const MOCK_HMAC_SECRET = "TEST_SECRET_HMAC_KEY_1234567890";

function createMockTransaction(overrides?: Partial<PaymobTransactionObject>): PaymobTransactionObject {
  return {
    id: 1002003,
    amount_cents: 45000,
    success: true,
    is_auth: false,
    is_capture: true,
    is_standalone_payment: true,
    is_voided: false,
    is_refunded: false,
    is_3d_secure: true,
    integration_id: 12345,
    currency: "EGP",
    pending: false,
    created_at: "2026-10-28T16:00:00.000000",
    error_occured: false,
    has_parent_transaction: false,
    owner: 999,
    order: {
      id: 555666,
      merchant_order_id: "ST-ORDER-TEST-001",
    },
    source_data: {
      pan: "2345",
      sub_type: "MasterCard",
      type: "card",
    },
    special_reference: "ST-ORDER-TEST-001",
    ...overrides,
  };
}

test("Paymob HMAC: generates correct hash and verifies valid/invalid signatures safely", () => {
  const tx = createMockTransaction();
  const validHmac = calculatePaymobHmac(tx, MOCK_HMAC_SECRET);
  assert.equal(typeof validHmac, "string");
  assert.equal(validHmac.length, 128); // SHA-512 hex length is 128 chars

  // 1. Valid HMAC matches
  assert.equal(verifyPaymobHmac(tx, validHmac, MOCK_HMAC_SECRET), true);

  // 2. Case insensitive match
  assert.equal(verifyPaymobHmac(tx, validHmac.toUpperCase(), MOCK_HMAC_SECRET), true);

  // 3. Invalid/tampered HMAC rejected
  const tamperedHmac = validHmac.slice(0, -4) + "0000";
  assert.equal(verifyPaymobHmac(tx, tamperedHmac, MOCK_HMAC_SECRET), false);

  // 4. Missing or empty HMAC rejected safely without throw
  assert.equal(verifyPaymobHmac(tx, "", MOCK_HMAC_SECRET), false);
  assert.equal(verifyPaymobHmac(tx, undefined, MOCK_HMAC_SECRET), false);
  assert.equal(verifyPaymobHmac(tx, null as unknown as string, MOCK_HMAC_SECRET), false);

  // 5. Tampered amount_cents changes HMAC
  const tamperedTx = { ...tx, amount_cents: 1000 };
  assert.equal(verifyPaymobHmac(tamperedTx, validHmac, MOCK_HMAC_SECRET), false);
});

test("Paymob Client: createIntention converts whole EGP to cents and calls Intention API", async () => {
  let capturedRequest: { url: string; headers: Record<string, string>; body: Record<string, unknown> } | null = null;

  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    capturedRequest = {
      url: input.toString(),
      headers: (init?.headers as Record<string, string>) || {},
      body: JSON.parse((init?.body as string) || "{}"),
    };
    return new Response(
      JSON.stringify({
        id: "intention_id_999",
        client_secret: "cs_live_sample_token_xyz",
        amount: 45000,
        currency: "EGP",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  };

  const client = new PaymobClient(
    {
      secretKey: "sec_test_secret_key",
      publicKey: "pub_test_public_key",
      integrationIdCard: 12345,
      hmacSecret: MOCK_HMAC_SECRET,
    },
    mockFetch
  );

  assert.equal(client.isConfigured(), true);

  const result = await client.createIntention({
    amount: 450, // 450 EGP
    currency: "EGP",
    orderNumber: "ST-ORDER-TEST-001",
    items: [{ name: "Cotton T-Shirt", unitPrice: 450, quantity: 1 }],
    billingData: {
      fullName: "Ahmed Ali",
      phone: "01012345678",
      email: "ahmed@example.com",
    },
  });

  assert.equal(result.intentionId, "intention_id_999");
  assert.equal(result.clientSecret, "cs_live_sample_token_xyz");
  assert.equal(result.amountCents, 45000);
  assert.ok(result.paymentUrl.includes("clientSecret=cs_live_sample_token_xyz"));

  assert.ok(capturedRequest);
  const req = capturedRequest as { url: string; headers: Record<string, string>; body: { amount: number; currency: string; special_reference: string; billing_data: { first_name: string; last_name: string } } };
  assert.equal(req.body.amount, 45000); // Converted 450 EGP to 45000 cents
  assert.equal(req.body.currency, "EGP");
  assert.equal(req.body.special_reference, "ST-ORDER-TEST-001");
  assert.equal(req.body.billing_data.first_name, "Ahmed");
  assert.equal(req.body.billing_data.last_name, "Ali");
});

test("Paymob Client: createIntention handles provider error and timeout safely", async () => {
  const failingFetch = async (): Promise<Response> => {
    return new Response(JSON.stringify({ detail: "Gateway timeout" }), { status: 504 });
  };

  const client = new PaymobClient(
    {
      secretKey: "sec_test_key",
      integrationIdCard: 12345,
      hmacSecret: MOCK_HMAC_SECRET,
    },
    failingFetch
  );

  await assert.rejects(async () => {
    await client.createIntention({
      amount: 200,
      orderNumber: "ST-TIMEOUT",
      items: [{ name: "Reward cards", unitPrice: 200, quantity: 1 }],
      billingData: { fullName: "Test", phone: "01000000000" },
    });
  }, /PAYMOB_INTENTION_FAILED_HTTP_504/);
});

test("Paymob Webhook Parser: handles success, decline, pending, cancellation, and invalid signatures", () => {
  const client = new PaymobClient({
    hmacSecret: MOCK_HMAC_SECRET,
    integrationIdCard: 12345,
    secretKey: "sec_key",
  });

  // 1. Success transaction
  const successTx = createMockTransaction({ success: true, pending: false });
  const successHmac = calculatePaymobHmac(successTx, MOCK_HMAC_SECRET);
  const successResult = client.verifyWebhook({ type: "TRANSACTION", obj: successTx }, successHmac);
  assert.equal(successResult.isValid, true);
  assert.equal(successResult.status, "PAID");
  assert.equal(successResult.orderNumber, "ST-ORDER-TEST-001");
  assert.equal(successResult.amountCents, 45000);

  // 2. Failed / declined transaction
  const failedTx = createMockTransaction({ success: false, pending: false, error_occured: true });
  const failedHmac = calculatePaymobHmac(failedTx, MOCK_HMAC_SECRET);
  const failedResult = client.verifyWebhook({ type: "TRANSACTION", obj: failedTx }, failedHmac);
  assert.equal(failedResult.isValid, true);
  assert.equal(failedResult.status, "FAILED");

  // 3. Pending 3DS transaction
  const pendingTx = createMockTransaction({ success: false, pending: true });
  const pendingHmac = calculatePaymobHmac(pendingTx, MOCK_HMAC_SECRET);
  const pendingResult = client.verifyWebhook({ type: "TRANSACTION", obj: pendingTx }, pendingHmac);
  assert.equal(pendingResult.isValid, true);
  assert.equal(pendingResult.status, "PENDING");

  // 4. Cancelled / voided transaction
  const voidedTx = createMockTransaction({ success: false, pending: false, is_voided: true });
  const voidedHmac = calculatePaymobHmac(voidedTx, MOCK_HMAC_SECRET);
  const voidedResult = client.verifyWebhook({ type: "TRANSACTION", obj: voidedTx }, voidedHmac);
  assert.equal(voidedResult.isValid, true);
  assert.equal(voidedResult.status, "CANCELLED");

  // 5. Invalid HMAC returns isValid: false
  const invalidResult = client.verifyWebhook({ type: "TRANSACTION", obj: successTx }, "bad_hmac_12345");
  assert.equal(invalidResult.isValid, false);
});

test("Paymob Webhook Idempotency: duplicate and replayed webhooks produce exact-once effects", () => {
  const client = new PaymobClient({
    hmacSecret: MOCK_HMAC_SECRET,
    integrationIdCard: 12345,
    secretKey: "sec_key",
  });

  const tx = createMockTransaction({ success: true, pending: false });
  const hmac = calculatePaymobHmac(tx, MOCK_HMAC_SECRET);

  // Simulating consecutive duplicate deliveries
  const delivery1 = client.verifyWebhook({ type: "TRANSACTION", obj: tx }, hmac);
  const delivery2 = client.verifyWebhook({ type: "TRANSACTION", obj: tx }, hmac);

  assert.equal(delivery1.isValid, true);
  assert.equal(delivery1.status, "PAID");
  assert.equal(delivery2.isValid, true);
  assert.equal(delivery2.status, "PAID");
  assert.equal(delivery1.transactionId, delivery2.transactionId);
  assert.equal(delivery1.orderNumber, delivery2.orderNumber);
});
