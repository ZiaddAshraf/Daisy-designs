import type {
  CreateIntentionParams,
  PaymobConfig,
  PaymobIntentionItem,
  PaymobIntentionResponse,
  PaymobPaymentStatus,
  PaymobWebhookPayload,
} from "./types";
import { verifyPaymobHmac } from "./hmac";

export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class PaymobClient {
  private readonly config: PaymobConfig;
  private readonly customFetch?: FetchFunction;

  constructor(config?: Partial<PaymobConfig>, customFetch?: FetchFunction) {
    this.config = {
      apiKey: config?.apiKey ?? process.env.PAYMOB_API_KEY,
      secretKey: config?.secretKey ?? process.env.PAYMOB_SECRET_KEY,
      publicKey: config?.publicKey ?? process.env.PAYMOB_PUBLIC_KEY,
      integrationIdCard: config?.integrationIdCard ?? (process.env.PAYMOB_INTEGRATION_ID ? Number(process.env.PAYMOB_INTEGRATION_ID) : undefined),
      hmacSecret: config?.hmacSecret ?? process.env.PAYMOB_HMAC_SECRET,
      apiBaseUrl: (config?.apiBaseUrl ?? process.env.PAYMOB_API_BASE ?? "https://accept.paymob.com").replace(/\/+$/, ""),
    };
    this.customFetch = customFetch;
  }

  isConfigured(): boolean {
    return Boolean(
      (this.config.secretKey || this.config.apiKey) &&
      this.config.integrationIdCard &&
      this.config.hmacSecret
    );
  }

  private async fetch(endpoint: string, init: RequestInit): Promise<Response> {
    const fn = this.customFetch ?? fetch;
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    return fn(url, init);
  }

  /**
   * Creates a payment intention via the official Paymob Flash/Intention API.
   * Converts whole EGP amount to minor units (cents).
   */
  async createIntention(params: CreateIntentionParams): Promise<{
    intentionId: string;
    clientSecret: string;
    paymentUrl: string;
    amountCents: number;
  }> {
    if (!this.isConfigured()) {
      throw new Error("PAYMOB_NOT_CONFIGURED");
    }

    if (!Number.isFinite(params.amount) || params.amount <= 0) {
      throw new Error("INVALID_PAYMENT_AMOUNT");
    }

    // Convert EGP whole units to minor units (piastres / cents)
    const amountCents = Math.round(params.amount * 100);
    const currency = (params.currency ?? "EGP").toUpperCase();

    const nameParts = (params.billingData.fullName || "Customer").trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    const items: PaymobIntentionItem[] = params.items.map((item) => ({
      name: item.name.slice(0, 80),
      amount: Math.round(item.unitPrice * 100),
      quantity: item.quantity,
    }));

    const body = {
      amount: amountCents,
      currency,
      payment_methods: [this.config.integrationIdCard!],
      items,
      billing_data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: params.billingData.phone || "NA",
        email: params.billingData.email || "customer@daisydesigns.com",
        city: params.billingData.city || "Cairo",
        country: "EG",
        state: params.billingData.governorate || "Cairo",
        street: (params.billingData.address || "Street").slice(0, 100),
        building: "1",
        floor: "1",
        apartment: "1",
      },
      special_reference: params.orderNumber,
      notification_url: params.notificationUrl,
      redirection_url: params.redirectionUrl,
    };

    const authToken = this.config.secretKey || this.config.apiKey;
    const response = await this.fetch("/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`PAYMOB_INTENTION_FAILED_HTTP_${response.status}`);
    }

    const data = (await response.json()) as PaymobIntentionResponse;
    if (!data.client_secret || !data.id) {
      throw new Error("PAYMOB_INTENTION_RESPONSE_INVALID");
    }

    // Unified checkout URL using client_secret and public_key
    const publicKey = this.config.publicKey || "";
    const paymentUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${data.client_secret}`;

    return {
      intentionId: data.id,
      clientSecret: data.client_secret,
      paymentUrl,
      amountCents,
    };
  }

  /**
   * Verifies and parses a Paymob transaction webhook payload.
   */
  verifyWebhook(payload: unknown, receivedHmac?: string): {
    isValid: boolean;
    orderNumber?: string;
    amountCents?: number;
    currency?: string;
    status: PaymobPaymentStatus;
    transactionId?: number;
    merchantOrderId?: string;
    rawObject?: unknown;
  } {
    if (!payload || typeof payload !== "object" || !("obj" in payload)) {
      return { isValid: false, status: "FAILED" };
    }

    const webhook = payload as PaymobWebhookPayload;
    const obj = webhook.obj;
    if (!obj || typeof obj !== "object") {
      return { isValid: false, status: "FAILED" };
    }

    const hmacSecret = this.config.hmacSecret || "";
    const isSignatureValid = verifyPaymobHmac(obj, receivedHmac, hmacSecret);

    if (!isSignatureValid) {
      return {
        isValid: false,
        status: "FAILED",
        orderNumber: obj.special_reference || obj.merchant_order_id,
        transactionId: obj.id,
      };
    }

    let status: PaymobPaymentStatus = "FAILED";
    if (obj.success === true && obj.pending === false) {
      status = "PAID";
    } else if (obj.pending === true) {
      status = "PENDING";
    } else if (obj.is_voided === true || obj.is_refunded === true) {
      status = "CANCELLED";
    } else {
      status = "FAILED";
    }

    return {
      isValid: true,
      orderNumber: obj.special_reference || obj.merchant_order_id,
      amountCents: obj.amount_cents,
      currency: obj.currency,
      status,
      transactionId: obj.id,
      merchantOrderId: obj.order?.merchant_order_id,
      rawObject: obj,
    };
  }
}

