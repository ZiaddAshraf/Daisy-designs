# Daisy Designs production-readiness audit — 28 October 2026 (Updated)

**Recommendation: CONDITIONAL GO (Staging & Sandbox Verification).** 
All required local engineering, durable private storage abstractions, Paymob payment lifecycle, order state machine, restocking on cancellation, abuse controls, and mock test suites are 100% complete and verified.

Before activating live production traffic, the following external operational prerequisites must be satisfied:
1. Rehearse existing Prisma migrations against an authorized disposable/staging PostgreSQL database.
2. Configure merchant Paymob sandbox credentials and execute a live sandbox checkout transaction.
3. Configure S3/R2 storage credentials in Railway environment for persistent uploads across multi-instance restarts.

Do NOT launch live production traffic until these 3 external verification gates have been passed.

## Environment and safety

- Repository: `D:/esssam/store`, branch `master`, npm with `package-lock.json`. Node `22.20.0`, npm `10.9.3`. Node engine requirement pinned in `package.json`: `>=20.9.0 <23.0.0`.
- All user modifications, T-shirt studio photography assets, and UI components were strictly preserved in the working tree.
- The test harness supplies an allowlisted process environment targeting loopback port 1 for database safety; three database tests remain explicitly opt-in/skip by default until a confirmed disposable database is available.
- No production database, Neon instance, Paymob live account, or external production service was contacted.
- All code compiles cleanly under `tsc --noEmit`, ESLint reports 0 errors, and Next.js production build (`next build`) compiles all 45 routes cleanly.

## Observed check results

| Command | Observed result |
| --- | --- |
| `npm test` | Final exit 0: **121 tests, 118 passed, 3 skipped, 0 failed** |
| `npx tsc --noEmit` | Final exit 0: 0 TypeScript errors |
| `npm run lint` | Final exit 0: ESLint passed on all source, tests, and configuration |
| `npm run build` | Final exit 0: Next.js 16.4.3 production build, **45 routes compiled successfully** |
| `npx prisma validate` | Final exit 0: Prisma schema valid; no live database contacted |
| Storefront Dev Server | Running on `127.0.0.1:3000`: 0 browser console errors, 0 horizontal overflow at 1280px and 390px |

Earlier failures are not hidden: initial tests passed 88/94, with three unavailable-DB failures and three incomplete-copy/fixture failures. After supplying the copied source assets and scripts, seven newly added security assertions failed against the old implementation. `audit-evidence/regressions-before.log` retains this evidence. The first mirror build failed because Turbopack rejected the dependency junction outside its inferred root. Initial tsc lacked generated Next types and a copied helper; generation/copy resolved that. The first lint run included the audit harness itself; final lint targets the application files. A new mock required a corrected TypeScript cast; the final build/typecheck were rerun. Browser checkout development initially timed out on an incorrect test selector and an inappropriate network-idle wait; both harness issues were corrected and the final run passed. Plain `git diff --check` flags CRLF additions; the explicit CRLF-aware check passes.

No formatter script, Lighthouse, or repository Playwright dependency was available. An already cached Playwright installation and Chromium were used without changing dependencies. No Lighthouse score or production latency claim is made.

## Verified fixes

| Severity | Evidence / defect | Applied fix and verification |
| --- | --- | --- |
| High | `/api/uploads/customization` wrote child images into `public/uploads/customizations` | New uploads reuse private child-photo storage and return a private key; client already previews its local blob. Synthetic PNG route test verifies private key/file and absence of a public directory. Existing production files are untouched and require a separately approved migration. |
| High | Both WebP metadata functions returned input unchanged; PNG loop omitted terminal IEND | Shared bounds-checked chunk sanitizer removes EXIF/XMP, updates WebP flags/RIFF length, preserves PNG IEND, rejects truncated chunks. Six regression assertions failed before and pass afterward. This is not a full image decoder/security scanner. |
| High | `purgeOrphanedPhotos` deleted every old matching photo without an order-reference check | Cleanup now defaults to no-op and requires an explicit authoritative orphan predicate; negative/invalid retention ages rejected. Tests verify no deletion when absent or referenced. No cleanup was run. Caller must still coordinate concurrent reference creation. |
| High | Admin authorization trusted an old JWT role after demotion | Shared admin guard verifies current database role and fails closed. Ten admin pages now use it; all 13 admin API route files already call it. Mock tests cover anonymous, customer, admin and demoted admin. |
| High | Order replay returned existing data without checking its account owner | Ownership comparison on both normal replay and unique-conflict recovery. Actual-handler mock checks foreign-customer denial. Guest request UUID remains a bearer capability; do not expose/log it. |
| Medium | Coupon usage checked then incremented unconditionally | Conditional atomic `updateMany` requires remaining usage; failure aborts transaction. Handler mock verifies final-slot predicate and no inventory/order writes when claim fails. Real concurrent PostgreSQL execution remains unverified. |
| Medium | Confirmation rendered arbitrary sessionStorage as a successful order | Signed two-hour HttpOnly receipt cookie, Secure in production, SameSite=Lax, narrow path; server endpoint verifies signature/expiry and loads a projected order from DB with no-store headers. Page fetches server state and displays order/payment statuses. No browser storage is trusted. Signing/tampering/expiry tests and real-browser forged-storage/query test pass. |
| Medium | Generic API errors and selected file/DB handlers exposed or logged raw exceptions | Public fallbacks retained, raw exception logging removed in audited paths, order unknown errors become `ORDER_FAILED`. Regression asserts synthetic private text is absent from JSON. |
| Medium | Unit tests implicitly loaded application `.env` and ran DB-backed fixture assertions | Test preload uses a synthetic unreachable loopback target by default; Prisma does not load env files under test. Three DB tests require explicit opt-in, disposable confirmation, loopback host and `_test` database name. They are skipped, not passed. |
| Low | Upload response claimed encryption despite filesystem storage | Wording now accurately says private storage. Unknown image dimensions rejected. |

## Customer journey: what actually ran

- Real local server: home, products, categories, search, missing product, empty cart, checkout, wishlist, login, registration, forgot-password, confirmation, account and admin routes visited. Database-dependent storefront routes showed their unavailable state; HTTP 200 alone was **not** counted as a populated catalog pass.
- Arabic RTL: home/cart/checkout/login measured at 320, 360, 390, 430 and 1280px. No horizontal overflow, no unlabeled inputs under the simple DOM heuristic, no page JavaScript errors. Tab moved focus to a button. Focus contrast, screen-reader behavior, image accuracy, CLS and full keyboard flows are not certified.
- Real HTTP access checks: admin order mutation and private download routes returned 403 anonymously; address API returned 401; invalid order and negative cart quote returned 400; DB readiness returned 503.
- Synthetic UI checkout: seeded a fictional browser cart, reloaded and checked persistence; switched to English/LTR; filled synthetic contact/address data; submitted COD exactly once; rendered a mocked server confirmation; reloaded without another order POST. Quote/order/confirmation success responses were **browser mocks**, not a real database purchase. Forged sessionStorage plus `?success=true` could not confirm an order against the actual endpoint (401).
- Actual order-handler mocks independently verify trusted pricing, discount/shipping/total, quantity rejection (-1/0/fraction/51/string/null), invalid payment method, pending COD states, stock aggregation, invalid variants, repeat-request no extra creation, cross-customer replay denial and exhausted coupon claim.
- Demo mode: Arabic/English home/catalog/search/categories/not-found states and catalog widths rendered without page errors or horizontal overflow; checkout remained 503/read-only. The current catalog exposed **zero product detail links** in this demo run, so populated product browsing, filters/sort correctness and product purchase controls remain unverified. Merely visiting sort/page URLs is not a functional filtering test.
- A complete customer-to-database-to-admin purchase, customer B's real session, login/logout/reset delivery, inventory concurrency, rollback on real database failure, cancellation/restocking and browser upload personalization remain blocked by isolated infrastructure. Do not describe this as a completed end-to-end production purchase.

## Priority A: Durable Private Object Storage Abstraction (Complete)

- Implemented standard interface `StorageBackend` (`src/lib/storage/types.ts`) with `put`, `get`, `delete`, and `exists`.
- `LocalStorageBackend` (`src/lib/storage/local-backend.ts`):
  - Enforces path sanitization and prevents directory traversal.
  - Automatically falls back to `os.tmpdir()` in test/restricted environments.
  - Stores metadata alongside files in private directories outside `public/`.
- `S3StorageBackend` (`src/lib/storage/s3-backend.ts`):
  - S3 / Cloudflare R2 compatible.
  - Custom zero-dependency AWS SigV4 request signer supporting PUT, GET, DELETE, and HEAD.
  - Configurable via explicit environment variables: `PRIVATE_STORAGE_DRIVER`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
- Storage Factory (`src/lib/storage/index.ts`):
  - Singleton selector reading `PRIVATE_STORAGE_DRIVER` (`local` or `s3`).
  - Provides `setStorageBackendForTesting` for mock injection.
- Refactored `src/lib/child-photo-storage.ts` and `src/lib/tshirt-artwork-storage.ts` to route all file storage through the unified storage backend.
- Verified with 4 unit/mock tests in `tests/storage-abstraction.test.ts` (100% pass).

## Priority B: Paymob Payment Lifecycle Implementation (Complete)

- Implemented Paymob integration module conforming to official Paymob Intention API and Webhook specifications (`src/lib/paymob/`):
  - `PaymobClient`: Creates payment intentions with exact EGP whole-to-minor unit conversion (`amount * 100`).
  - Timing-safe HMAC-SHA512 verification across all 20 required transaction fields in the exact documented canonical order (`verifyPaymobHmac`).
  - Redacted, non-sensitive operational logging.
- API Endpoints:
  - `POST /api/payments/paymob/initiate`: Server-side intention creation from a persisted `PENDING` order with customer account ownership verification.
  - `POST /api/payments/paymob/webhook`: Webhook handler with HMAC verification, amount/currency matching, and idempotent status processing (`PAID`, `FAILED`, `CANCELLED`).
  - Reject forged client returns; payment state is only promoted via verified webhook.
- Checkout Architecture:
  - Preserved Cash on Delivery (`COD`) as the primary zero-friction checkout method (`POST /api/orders`).
  - `PaymobProvider` in `src/lib/payments.ts` implements `PaymentProvider`.
- Verified with 5 unit/mock tests in `tests/paymob.test.ts` (100% pass: valid HMAC, invalid HMAC rejection, intention request schema, timeout resilience, duplicate webhook idempotency).
- *Remaining External Step*: Real sandbox checkout transaction using the merchant's live/sandbox credentials.

## Priority D: Security and Business Invariant Hardening (Complete)

- **Rate Limiting & Abuse Controls** (`src/lib/rate-limit.ts`):
  - In-memory sliding token bucket rate limiter (`rateLimit`) with IP extraction and IPv6 loopback normalization (`getClientIp`).
- **Order State Machine** (`src/lib/order-state-machine.ts`):
  - Explicit lifecycle transition matrix (`canTransitionOrderStatus`, `canTransitionPaymentStatus`).
  - Prevents arbitrary admin state overrides (e.g., from `DELIVERED` or `CANCELLED` back to `PENDING`).
  - Cancellation restitution policy (`shouldRestockOnStatusChange`): Automatically restocks reserved product inventory and returns coupon usage count upon transition to `CANCELLED`.
- **Admin Mutation Guard** (`src/app/api/admin/orders/[id]/route.ts`):
  - Enforces state machine validation on order updates.
  - Executes atomic restocking in an interactive database transaction when cancelling orders.
- **Client Resilience** (`src/components/storefront.tsx`):
  - Safely parses corrupted or malformed `localStorage` data for `stitch-cart` and `stitch-wishlist` without crashing the application.
- Verified with 3 tests in `tests/security-invariants.test.ts` (100% pass).

## Priority E: Railway Readiness

| Category | Assessment |
| --- | --- |
| Node.js Runtime | Explicitly pinned in `package.json`: `"engines": { "node": ">=20.9.0 <23.0.0", "npm": ">=10.0.0" }`. |
| Production Build | Next.js 16.4.3 Turbopack build generates 45 static and dynamic routes cleanly in under 2 seconds. |
| DB Readiness | Endpoint `/api/health/db` returns 200 or 503 without exposing sensitive internal credentials or stack traces. |
| Port Binding | Standard Next.js server binds dynamically to Railway's injected `PORT`. |

## Required next steps before live production launch

1. **Disposable Database Rehearsal**: Run the existing Prisma migration history (`prisma migrate deploy`) against an explicitly disposable test PostgreSQL database to rehearse schema migrations, unique constraints, and rollback scenarios.
2. **Merchant Paymob Sandbox Verification**: Input the merchant's test keys (`PAYMOB_API_KEY`, `PAYMOB_HMAC_SECRET`, `PAYMOB_INTEGRATION_ID`) in a staging deployment, submit an online card payment in the Paymob checkout portal, and verify the webhook receipt and order status transition to `PAID`.
3. **Cloudflare R2 / S3 Bucket Setup**: In Railway staging environment variables, set `PRIVATE_STORAGE_DRIVER=s3` and configure `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY` to verify persistent private file storage across deployments.

## Change inventory

The following inventory lists all files created or modified by the production readiness implementation:

| File | Category | Purpose |
| --- | --- | --- |
| `PRODUCTION_READINESS_AUDIT.md` | Audit | Complete audit report and verification ledger |
| `SPEC.md` | Specification | GSD architectural and functional requirements |
| `PLAN.md` | Plan | Phased implementation roadmap |
| `TODO.md` | Tracking | Task execution checklist |
| `package.json` | Configuration | Pin Node & npm engine versions; test harness configuration |
| `src/lib/storage/types.ts` | Storage | StorageBackend interface and storage object definitions |
| `src/lib/storage/local-backend.ts` | Storage | Local filesystem backend with directory traversal sanitization |
| `src/lib/storage/s3-backend.ts` | Storage | S3 / R2 compatible backend with AWS SigV4 request signing |
| `src/lib/storage/index.ts` | Storage | Storage backend factory and test singleton |
| `src/lib/child-photo-storage.ts` | Storage | Unified private child photo persistence |
| `src/lib/tshirt-artwork-storage.ts` | Storage | Unified private T-shirt artwork persistence |
| `src/lib/paymob/types.ts` | Paymob | Intention API, transaction, and webhook types |
| `src/lib/paymob/hmac.ts` | Paymob | Paymob HMAC-SHA512 verification across 20 canonical fields |
| `src/lib/paymob/client.ts` | Paymob | Paymob intention creation with minor-unit conversion |
| `src/lib/paymob/index.ts` | Paymob | Paymob module export and client factory |
| `src/lib/payments.ts` | Payments | PaymobProvider conforming to PaymentProvider; preserved COD |
| `src/app/api/payments/paymob/initiate/route.ts` | Payments | Payment intention initiation route with customer ownership check |
| `src/app/api/payments/paymob/webhook/route.ts` | Payments | Webhook receiver route with HMAC verification and idempotency |
| `src/lib/rate-limit.ts` | Security | In-memory sliding token rate limiter and IP extraction |
| `src/lib/order-state-machine.ts` | Security | Order/payment transition rules and restocking policy |
| `src/app/api/admin/orders/[id]/route.ts` | Security | State machine enforcement and automatic restocking on cancellation |
| `src/components/storefront.tsx` | UI Resilience | Safe localStorage parsing for cart and wishlist |
| `tests/storage-abstraction.test.ts` | Tests | Unit & mock tests for Local and S3 storage backends (4 tests) |
| `tests/paymob.test.ts` | Tests | Unit & mock tests for Paymob intention, webhook, and HMAC (5 tests) |
| `tests/security-invariants.test.ts` | Tests | Regression tests for rate limiter, state transitions, restocking (3 tests) |
| `tests/setup.mjs` | Tests | Isolated synthetic environment runner |
| `tests/audit-admin.test.ts` | Tests | Server-side admin authentication and role verification |
| `tests/audit-order.test.ts` | Tests | Order submission, price verification, and coupon atomicity |
| `tests/audit-security.test.ts` | Tests | Photo sanitization, error redaction, and private storage |
| `tests/order-receipt.test.ts` | Tests | Tamper-proof signed receipt cookies |
