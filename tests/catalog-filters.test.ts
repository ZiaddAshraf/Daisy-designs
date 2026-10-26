import assert from "node:assert/strict";
import test from "node:test";
import { getFilterRemovalHref } from "../src/lib/catalog-filters";

test("removing a catalog filter preserves remaining selections and clears pagination", () => {
  assert.equal(
    getFilterRemovalHref("/products", {
      category: "school-stickers",
      collection: "back-to-school",
      min: "100",
      max: undefined,
      availability: "in-stock",
      customizable: "true",
      sort: "price-asc",
      page: "2",
      limit: "12",
    }, "category"),
    "/products?collection=back-to-school&min=100&availability=in-stock&customizable=true&sort=price-asc",
  );
});

test("filter removal keeps the current route and search query", () => {
  assert.equal(
    getFilterRemovalHref("/search", { q: "school bag", collection: "back-to-school", page: "3" }, "collection"),
    "/search?q=school+bag",
  );
  assert.equal(getFilterRemovalHref("/categories/school-stickers", { page: "2", limit: "12" }, "min"), "/categories/school-stickers");
});
