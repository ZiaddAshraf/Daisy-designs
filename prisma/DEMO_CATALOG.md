# Fictional demo catalog

`demo-catalog.ts` contains 30 fictional products, 7 categories, and 4 collections for visual review. It is not client-approved inventory, pricing, or stock. Records use `DEMO_CATALOG_V1`, `DEMO` tags/SKUs/slugs, and explicit disclaimer text. Everything is unpublished so public product, category, and collection pages do not show it.

## Validate and preview

From `D:\esssam\store`:

```powershell
npm run db:demo:dry-run
```

This validates the fixture offline and does not connect to PostgreSQL.

## Optional local-only import

The import script is add-only. It never calls `delete`, `update`, `upsert`, reset, seed, or migration operations. It checks the database target is exactly local `127.0.0.1/stitch` and requires a separate opt-in. Existing matching demo records are skipped without modification; any conflicting non-demo slug or SKU aborts the transaction.

Only if a local import is deliberately wanted, in PowerShell:

```powershell
$env:ALLOW_LOCAL_DEMO_CATALOG_IMPORT = 'YES'
npm run db:demo:apply-local
Remove-Item Env:ALLOW_LOCAL_DEMO_CATALOG_IMPORT
```

The script refuses Neon and every non-local database. It should not be altered to accept production for this demo fixture. Do not use `prisma/seed.ts`; it is destructive.

## Client catalog handoff

When approved client data arrives, validate it separately and import it through a reviewed add-only workflow. Keep these demo records unpublished. Replacing demo rows is a separate, explicitly reviewed cleanup task scoped only to rows carrying the `DEMO_CATALOG_V1` marker, after a backup and verification of the client import. This importer never removes demo or client records.
