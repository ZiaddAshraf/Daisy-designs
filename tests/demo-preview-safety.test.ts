import assert from "node:assert/strict";
import test from "node:test";
import { isLocalDemoPreviewEnabled, isOrderableCatalogProduct } from "../src/lib/demo-preview-safety";

test("local demo preview is enabled only for development on 127.0.0.1/stitch", () => {
  const localUrl = "postgresql://localhost-user:localhost-pass@127.0.0.1:5432/stitch";
  assert.equal(isLocalDemoPreviewEnabled("development", localUrl), true);
  assert.equal(isLocalDemoPreviewEnabled("production", localUrl), false);
  assert.equal(isLocalDemoPreviewEnabled("development", "postgresql://u:p@localhost:5432/stitch"), false);
  assert.equal(isLocalDemoPreviewEnabled("development", "postgresql://u:p@127.0.0.1:5432/neondb"), false);
  assert.equal(isLocalDemoPreviewEnabled("development", "not-a-url"), false);
});

test("demo products are never orderable, even if accidentally published", () => {
  assert.equal(isOrderableCatalogProduct({ slug: "demo-labels", name: "DEMO — Labels", tags: ["DEMO_CATALOG_V1"], published: true }), false);
  assert.equal(isOrderableCatalogProduct({ slug: "real-labels", name: "Labels", tags: [], published: false }), false);
  assert.equal(isOrderableCatalogProduct({ slug: "real-labels", name: "Labels", tags: [], published: true }), true);
});
