# SPEC: Daisy Designs Production Readiness Implementation

## 1. Context & Objectives
Resume and complete the production readiness work outlined in `PRODUCTION_READINESS_AUDIT.md` for Daisy Designs (`D:\esssam\store`) without restarting from scratch.
All 39 audit-modified files are already present and verified in `store`, with 106 passing unit/mock tests (3 skipped database tests requiring disposable DB).

## 2. Non-Negotiable Constraints & Safety Rules
1. Preserve all existing user work and uncommitted changes (T-shirt studio photography, categories card redesign, wishlist display, size pills).
2. Never open, print, expose, or modify `.env` or other secret-bearing files.
3. Never connect to production Neon or any production service.
4. Never run production migrations, seeds, cleanup, or writes.
5. Never make live Paymob charges or refunds.
6. Never send real customer emails.
7. Do not deploy, push, commit, change DNS, or alter external account settings.
8. Do not claim success without observed test evidence.
9. Do not bypass authentication, authorization, payment verification, or security checks.
10. Do not assume loopback port 5432 is a disposable database.

## 3. Scope of Work

### Priority A: Durable Private Object Storage
- Design and implement a storage abstraction interface (`put`, `get`, `delete`, `exists`).
- Implement `LocalStorageBackend` storing files outside `public/` in private directory.
- Implement `S3StorageBackend` compatible with Cloudflare R2 / AWS S3 using AWS SigV4.
- Factory selecting backend based on `PRIVATE_STORAGE_DRIVER` ("local" | "s3").
- Configuration via named env vars: `PRIVATE_STORAGE_DRIVER`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
- Validate file size, magic bytes, MIME types, image dimensions, and metadata stripping.
- Unit and integration tests for storage operations, permissions, and fallback resilience.

### Priority B: Paymob Payment Lifecycle
- Official Paymob Intention API and Webhook HMAC integration.
- Server-side initiation from pending order with explicit minor units (cents) conversion.
- Verified callback HMAC computation and timing-safe comparison.
- Idempotent processing, atomic state transitions, and out-of-order event handling.
- Protection against forged query parameters (`?success=true`).
- Preservation of Cash on Delivery (COD).
- Full mock test matrix (success, decline, cancel, pending, bad HMAC, replayed webhook, out-of-order, timeout).

### Priority D: Security & Business Invariant Gaps
- In-memory rate limiting and abuse controls for sensitive routes.
- Request idempotency bound to request-body fingerprint.
- Order state transition engine preventing invalid status jumps.
- Stock & coupon restoration on order cancellation.
- Robust parsing of corrupted localStorage data.
- Input validation bounds on shipping, money, and admin pagination.

### Priority C & E: Database Isolation & Railway Readiness
- Document disposable database status and prerequisites for skipped DB tests.
- Pin Node engine in `package.json`.
- Document Railway environment requirements and deployment architecture.

### Priority F: Ultra-Frictionless UI/UX for Non-Tech Audience (Steve Krug "Don't Make Me Think")
1. **Prominent Action Buttons on Home Featured Cards**:
   - Every featured card must feature an explicit, accessible CTA button (`[اختاري التفاصيل والتصميم ←]` or `[أضيفي للسلة 🛒]`).
   - Ensures zero doubt about whether a card is clickable or for sale.
2. **Contextual Age Labels for Children's T-shirt Size Pills**:
   - Provide explicit age annotations (e.g. `مقاس 6 (سن 5 - 6 سنوات)`) so parents have zero hesitation about sizing.
3. **Persistent Floating WhatsApp Consultation & Quick Order Widget**:
   - Floating corner widget with friendly tooltip for instant customer support or direct WhatsApp order placement.
4. **Mobile Sticky Bottom "Add to Cart / Buy Now" Bar**:
   - Sticky bar on mobile viewports for custom product pages when scrolling past the main action zone.
5. **Visual Guided Feedback on Missing Customization Fields**:
   - Animated visual cue (pulse / highlight) when attempting to order without uploading artwork or typing notes.
- Full verification: TypeScript, ESLint, npm test, production build.
- Update `PRODUCTION_READINESS_AUDIT.md`.

## 4. Final Production Readiness Audit Specifications (Vercel + COD + WhatsApp Launch)
- **Deployment Platform**: Vercel Serverless runtime.
- **Payment Method**: Pure Cash on Delivery (COD) for launch.
- **Order Notification**: Instant WhatsApp order notification prefill addressing configurable store owner number (`NEXT_PUBLIC_WHATSAPP_NUMBER`), containing order reference, customer name, phone, full address, item names, quantities, formatted customization without private keys, final total, and COD payment method.
- **Durable File Storage**: AWS S3 / Cloudflare R2 object storage integration (`PRIVATE_STORAGE_DRIVER=s3`) ensuring uploaded child photos and T-shirt artwork survive serverless lambda lifecycle and scale across multiple Vercel instances. Admin retrieval streams from storage backend with local fallback.
- **Security & Authorization**: Hardened admin verification checking current database role, rate limiting, request idempotency, signed HttpOnly receipt cookies for order confirmation, and zero private storage key leakage.
- **Reporting**: Produce `FINAL_PRODUCTION_READINESS_REPORT.md` covering all 15 required sections.
