import assert from "node:assert/strict";
import test from "node:test";
import { demoCatalog, DEMO_CATALOG_MARKER } from "../prisma/demo-catalog";
import { validateDemoCatalog } from "../scripts/demo-catalog-validation";

test("demo catalog has the requested size and remains unpublished", () => {
  const catalog = validateDemoCatalog(demoCatalog);
  assert.equal(catalog.categories.length, 7);
  assert.equal(catalog.collections.length, 4);
  assert.equal(catalog.products.length, 30);
  assert.ok(catalog.categories.every(({ published }) => published === false));
  assert.ok(catalog.collections.every(({ published }) => published === false));
  assert.ok(catalog.products.every(({ published }) => published === false));
});

test("demo records have explicit markers, unique identities, and valid relationships", () => {
  const catalog = validateDemoCatalog(demoCatalog);
  assert.ok(catalog.products.every(({ tags, slug, sku }) =>
    tags.includes(DEMO_CATALOG_MARKER) && slug.startsWith("demo-") && sku.startsWith("DEMO-DD-")));
  assert.ok(catalog.products.every(({ categorySlug, collectionSlug }) =>
    catalog.categories.some(({ slug }) => slug === categorySlug) &&
    catalog.collections.some(({ slug }) => slug === collectionSlug)));
  assert.ok(catalog.products.every(({ price, stock }) => price > 0 && stock >= 0));
});

test("catalog validation rejects publication and duplicate SKU regressions", () => {
  const accidentallyPublished = {
    ...demoCatalog,
    products: demoCatalog.products.map((product, index) => index === 0 ? { ...product, published: true } : product),
  };
  assert.throws(() => validateDemoCatalog(accidentallyPublished));

  const duplicateSku = {
    ...demoCatalog,
    products: demoCatalog.products.map((product, index) => index === 1
      ? { ...product, sku: demoCatalog.products[0].sku }
      : product),
  };
  assert.throws(() => validateDemoCatalog(duplicateSku), /Duplicate product SKU/);
});
