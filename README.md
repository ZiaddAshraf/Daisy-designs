# Daisy Designs

متجر عربي لمنتجات الأطفال المخصصة، مبني باستخدام Next.js 16 وPrisma 7 وPostgreSQL وAuth.js. الدفع المتاح حاليًا هو الدفع عند الاستلام فقط.

## Local development

1. Install dependencies with `npm install`.
2. Set `DATABASE_URL`, `SHADOW_DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in `.env`.
3. Generate Prisma Client with `npm run db:generate` (also runs after dependency installation).
4. Apply development migrations with `npm run db:migrate`.
5. Start the application with `npm run dev`.

`.env.example` contains blank secret fields. Do not put credentials in it or commit `.env`.

## Database commands

- `npm run db:migrate` creates and applies migrations for local development.
- `npm run db:deploy` applies committed migrations with `prisma migrate deploy`.
- `npm run db:validate` validates the Prisma schema.
- `npm run db:health` performs a read-only database health check.

Review the database target and migration status before running `db:deploy` against any production database. Do not use `db push` in place of the migration history.

`npm run db:seed` is a destructive development seed. It deletes existing catalog, customer, order, cart, review, coupon, and settings records, then creates demo data. It is blocked in production and refuses non-local databases; to run it locally, explicitly set `ALLOW_DESTRUCTIVE_SEED=true`. Demo-account passwords are random and unavailable. Never run it against a database containing data you need to keep.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```
