import assert from "node:assert/strict";
import test from "node:test";
import { collectionTextForLocale, selectLocalizedText, toStorefrontProduct } from "../src/lib/catalog";
import { getDemoProducts } from "../src/lib/demo-catalog-data";
import { formatPrice } from "../src/lib/products";

const product = {
  slug: "sample-product",
  name: "Sample Name",
  arabicName: "اسم تجريبي",
  description: "Merchant written English description.",
  arabicDescription: "وصف عربي كتبه التاجر.",
  price: 100,
  compareAtPrice: null,
  customizable: true,
  images: [],
  variants: [],
  category: { name: "School supplies", arabicName: "أدوات مدرسية" },
};

test("localized catalog fields select the authored value for the active locale", () => {
  assert.equal(selectLocalizedText("en", product.name, product.arabicName), "Sample Name");
  assert.equal(selectLocalizedText("ar", product.name, product.arabicName), "اسم تجريبي");
  assert.equal(selectLocalizedText("en", product.description, product.arabicDescription), "Merchant written English description.");
  assert.equal(selectLocalizedText("ar", product.description, product.arabicDescription), "وصف عربي كتبه التاجر.");
});

test("localized catalog fields fall back to the existing authored value when a translation is blank", () => {
  assert.equal(selectLocalizedText("en", "English source", "  "), "English source");
  assert.equal(selectLocalizedText("ar", "English source", null), "English source");
  assert.equal(selectLocalizedText("en", "English source", undefined), "English source");
});

test("storefront products use localized product and category fields without rewriting merchant content", () => {
  const english = toStorefrontProduct(product, "en");
  const arabic = toStorefrontProduct(product, "ar");
  assert.equal(english.name, "Sample Name");
  assert.equal(english.description, "Merchant written English description.");
  assert.equal(english.category, "School supplies");
  assert.equal(arabic.name, "اسم تجريبي");
  assert.equal(arabic.description, "وصف عربي كتبه التاجر.");
  assert.equal(arabic.category, "أدوات مدرسية");
});

test("demo catalog products use authored locale fields and keep the preview marker out of names", () => {
  const demo = getDemoProducts()[0];
  const english = toStorefrontProduct(demo, "en");
  const arabic = toStorefrontProduct(demo, "ar");
  assert.equal(english.name, demo.name.replace(/^DEMO — /, ""));
  assert.equal(arabic.name, demo.arabicName.replace(/^DEMO — /, ""));
  assert.equal(english.description, demo.description);
  assert.equal(arabic.description, demo.arabicDescription);
  assert.ok(!english.name.startsWith("DEMO — "));
});

test("catalog prices use locale-appropriate numerals and currency labels", () => {
  assert.equal(formatPrice(149, "en"), "149 EGP");
  assert.equal(formatPrice(149, "ar"), "١٤٩ ج.م");
});

test("collection text without a locale pair stays verbatim in either locale", () => {
  const storedName = "مجموعة اختارها التاجر";
  assert.equal(collectionTextForLocale(storedName, "ar"), storedName);
  assert.equal(collectionTextForLocale(storedName, "en"), storedName);
  assert.equal(collectionTextForLocale(null, "en"), null);
});

