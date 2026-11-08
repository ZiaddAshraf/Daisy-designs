# PLAN: Daisy Designs Production Readiness Implementation

## Phase 1: Recovery and Baseline Verification
- [x] Verify current Git status, modified files, and untracked files in `D:\esssam\store`.
- [x] Compare audit evidence in `store-audit-20261028` with `D:\esssam\store` (39 files match 100%).
- [x] Run baseline checks (`tsc`, `lint`, `npm test`: 106 pass, 3 skip).
- [x] Spawn storefront UI/UX browser inspection subagent.

## Phase 2: Priority A — Durable Private Object Storage Abstraction
- [x] Create `src/lib/storage/types.ts` defining `StorageBackend` interface.
- [x] Implement `src/lib/storage/local-backend.ts` for safe local filesystem storage.
- [x] Implement `src/lib/storage/s3-backend.ts` for S3 / Cloudflare R2 compatibility.
- [x] Implement `src/lib/storage/index.ts` factory reading `PRIVATE_STORAGE_DRIVER`.
- [x] Refactor upload libraries (`child-photo-storage.ts`, `tshirt-artwork-storage.ts`) to use storage abstraction.
- [x] Update upload routes (`/api/uploads/story-child-photo`, `/api/uploads/tshirt-artwork`, `/api/uploads/customization`) to store via abstraction.
- [x] Update admin retrieval routes to stream from storage backend.
- [x] Write comprehensive storage tests in `tests/storage-abstraction.test.ts`.
- [x] Verify with `npm test`, `tsc --noEmit`, and `npm run lint`.

## Phase 3: Priority B — Implement Paymob Payment Lifecycle
- [x] Create `src/lib/paymob/types.ts` for Intention API and HMAC signatures.
- [x] Implement `src/lib/paymob/client.ts` with intention creation, HMAC verification, and status mapping.
- [x] Implement `PaymobProvider` in `src/lib/payments.ts` implementing `PaymentProvider`.
- [x] Update `src/lib/order-validation.ts` to allow `PAYMOB` alongside `COD`.
- [x] Create `src/app/api/payments/paymob/initiate/route.ts` for order-backed payment session creation.
- [x] Create `src/app/api/payments/paymob/webhook/route.ts` with HMAC verification and idempotent state transitions.
- [x] Create test suite `tests/paymob.test.ts` with full mock matrix.
- [x] Verify with `npm test`, `tsc --noEmit`, and `npm run lint`.

## Phase 4: Priority D — Security and Business Invariant Gaps
- [x] Implement rate limiting utility `src/lib/rate-limit.ts`.
- [x] Apply rate limiting to auth, contact, checkout, and upload endpoints.
- [x] Implement request body fingerprinting for idempotency in `src/app/api/orders/route.ts`.
- [x] Implement order state machine in `src/lib/order-state-machine.ts`.
- [x] Implement restocking & coupon recovery on cancellation in `src/app/api/admin/orders/[id]/route.ts`.
- [x] Add bounds checks to admin pagination and money helpers.
- [x] Add corrupted JSON parsing safeguards in `StoreShell` (`src/components/storefront.tsx`).
- [x] Write regression tests in `tests/security-invariants.test.ts`.
- [x] Verify with `npm test`, `tsc --noEmit`, and `npm run lint`.

## Phase 5: Priority C & E — Railway Readiness & Final Audit Report
- [x] Pin supported Node engine in `package.json` (`"engines": { "node": ">=20.9.0 <23.0.0" }`).
- [x] Verify `npm run build` succeeds cleanly.
- [x] Document database status (reasons why the 3 DB tests remain skipped without a verified disposable DB).
- [x] Update `PRODUCTION_READINESS_AUDIT.md` with updated check tables, test counts, storage design, Paymob status, and GO/NO-GO assessment.

## Phase 6: Priority F — Ultra-Frictionless UI/UX Enhancements for Non-Tech Audience
- [x] Step 6.1: Add explicit, high-contrast action CTA buttons to `HomeFeaturedGrid` (`src/components/home-featured-grid.tsx`).
- [x] Step 6.2: Add contextual child age helpers to T-shirt size pills (`src/components/tshirt-preview.tsx`).
- [x] Step 6.3: Implement persistent floating WhatsApp consultation & quick-order widget (`src/components/whatsapp-floating-button.tsx`).
- [x] Step 6.4: Implement mobile sticky bottom action bar for custom product pages (`src/components/tshirt-preview.tsx`, etc.).
- [x] Step 6.5: Implement visual pulse animation on missing upload/notes in `TShirtPreview`.
- [x] Step 6.6: Verify with `npm test`, `tsc --noEmit`, `npm run lint`, and `npm run build`.
- [x] Step 6.7: Run `/browser` verification to visually inspect and verify all 5 UX improvements in real Chrome sessions at 390px and 1280px.

## Phase 7: Storefront Visual Redesign & Deployment Persistence Fixes
- [x] Step 7.1: Modernize `/categories` cards: remove technical crop brackets and duplicate gray blocks; add glassmorphism badges, feature highlight chips, and tactile brand teal action buttons.
- [x] Step 7.2: Guarantee 4th product visibility on Homepage: ensure `custom-printed-tshirt` is permanently prioritized and fallback-injected if absent in remote DB on deployment.
- [x] Step 7.3: T-Shirt size selector & garment photography: removed `cm`/`سم` from size pills; created matching high-res flat-lay studio mockups for black and gray shirts to mirror the white shirt.
- [x] Step 7.4: Floating WhatsApp widget: direct link to `01152606234` without pre-filled message text.
- [x] Step 7.5: Full verification suite: 123 tests (120 passed, 3 skipped DB, 0 failed), 0 typecheck errors, 0 ESLint warnings, 46/46 routes compiled cleanly.

## Phase 8: Final Production Readiness Audit & Vercel COD Launch Workflow
- [x] Step 8.1: Vercel serverless environment & durable file storage audit:
  - Ensured T-shirt artwork upload routes through `storage.put(...)`.
  - Ensured admin artwork/photo retrieval routes use `storage.get(...)` with local fallback.
  - Documented requirement for Cloudflare R2 / S3 object storage when deploying to Vercel serverless runtime.
- [x] Step 8.2: Customer checkout journey audit:
  - Verified server-side price recalculation, Egyptian mobile validation, address validation, and atomic stock decrements.
  - Verified idempotency and duplicate submission prevention via request ID.
- [x] Step 8.3: WhatsApp order notification flow:
  - Enhanced `/api/orders/confirmation` to securely provide shipping address to authorized confirmation page.
  - Implemented bilingual WhatsApp order message prefill containing order reference, customer name, phone, address, items, quantities, formatted customization without private keys, total, and COD payment method.
  - Made store phone number configurable via `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- [x] Step 8.4: Admin dashboard and database persistence audit:
  - Verified `isAdmin()` authorization fails closed against database role.
  - Verified order fulfillment updates and restocking state machine.
- [x] Step 8.5: Full verification pass:
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors.
  - `npm test`: 127 tests (124 passed, 3 skipped DB tests, 0 failed).
  - `npx prisma validate`: valid schema.
  - `npm run build`: 46/46 routes compiled successfully in Next.js 16.4.3 Turbopack.
- [x] Step 8.6: Authored `FINAL_PRODUCTION_READINESS_REPORT.md`.
