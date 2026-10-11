import assert from "node:assert/strict";
import test from "node:test";
import { getDemoCatalogPage, getDemoCategories, getDemoCollections, getDemoProduct } from "../src/lib/demo-catalog-data";

test("server fixture serves all unpublished demo catalog records without database rows", () => {
  const page = getDemoCatalogPage({ limit: "48" });
  assert.equal(page.total, 30);
  assert.equal(page.items.length, 30);
  assert.equal(getDemoCategories().length, 7);
  assert.equal(getDemoCollections().length, 4);
  assert.deepEqual(getDemoCollections().map((collection) => collection.name), [
    "جاهزون للمدرسة",
    "تفاصيل يومية شخصية",
    "هدايا بلمسة شخصية",
    "اختيارات دايزي",
  ]);
  assert.ok(page.items.every((product) => product.published === false));
  assert.ok(getDemoCategories().every((category) => category.published === false));
  assert.ok(getDemoCollections().every((collection) => collection.published === false));
});

test("demo category and collection filters only return associated fixture products", () => {
  const category = getDemoCategories()[0];
  const collection = getDemoCollections()[0];
  const categoryProducts = getDemoCatalogPage({ category: category.slug, limit: "48" });
  const collectionProducts = getDemoCatalogPage({ collection: collection.slug, limit: "48" });
  assert.ok(categoryProducts.items.length > 0);
  assert.ok(categoryProducts.items.every((product) => product.category.slug === category.slug));
  assert.ok(collectionProducts.items.length > 0);
  assert.ok(collectionProducts.items.every((product) => product.collection?.slug === collection.slug));
  assert.equal(getDemoProduct("demo-does-not-exist"), null);
});
