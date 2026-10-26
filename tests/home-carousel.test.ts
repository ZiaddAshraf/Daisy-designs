import assert from "node:assert/strict";
import test from "node:test";
import { getCarouselScrollDelta } from "../src/lib/home-carousel";
import { toStorefrontProduct } from "../src/lib/catalog";

test("carousel next and previous follow logical direction in RTL and LTR", () => {
  assert.equal(getCarouselScrollDelta("rtl", "next", 1000), -820);
  assert.equal(getCarouselScrollDelta("rtl", "previous", 1000), 820);
  assert.equal(getCarouselScrollDelta("ltr", "next", 1000), 820);
  assert.equal(getCarouselScrollDelta("ltr", "previous", 1000), -820);
});

test("carousel scroll distance is safe for unusable viewport widths", () => {
  assert.equal(getCarouselScrollDelta("rtl", "next", 0), 0);
  assert.equal(getCarouselScrollDelta("rtl", "next", Number.NaN), 0);
});

test("toStorefrontProduct maps database price, images, compareAtPrice, and localization", () => {
  const dbProduct = {
    slug: "custom-notebook",
    name: "Personalized Notebook",
    arabicName: "دفتر مخصص",
    price: 180,
    compareAtPrice: 220,
    description: "Premium personalized spiral notebook",
    arabicDescription: "دفتر سلك مخصص عالي الجودة",
    customizable: true,
    featured: true,
    images: [{ url: "/products/notebook.jpeg" }],
    category: { name: "Stationery", arabicName: "أدوات مكتبية" },
  };

  const arProduct = toStorefrontProduct(dbProduct, "ar");
  assert.equal(arProduct.price, 180);
  assert.equal(arProduct.compareAtPrice, 220);
  assert.equal(arProduct.name, "دفتر مخصص");
  assert.equal(arProduct.image, "/products/notebook.jpeg");
  assert.equal(arProduct.category, "أدوات مكتبية");
  assert.equal(arProduct.customizationTag, "مخصص بالكامل");

  const enProduct = toStorefrontProduct(dbProduct, "en");
  assert.equal(enProduct.price, 180);
  assert.equal(enProduct.name, "Personalized Notebook");
  assert.equal(enProduct.category, "Stationery");
  assert.equal(enProduct.customizationTag, "Customizable");
});

test("featured products filtering isolates featured records from general catalog", () => {
  const catalog = [
    { id: "1", slug: "p1", featured: true, name: "Featured 1" },
    { id: "2", slug: "p2", featured: false, name: "Regular 1" },
    { id: "3", slug: "p3", featured: true, name: "Featured 2" },
    { id: "4", slug: "p4", featured: false, name: "Regular 2" },
  ];

  const featuredRecords = catalog.filter((p) => p.featured);
  assert.equal(featuredRecords.length, 2);
  assert.deepEqual(featuredRecords.map((p) => p.slug), ["p1", "p3"]);

  const remainingRecords = catalog.filter((p) => !featuredRecords.some((f) => f.id === p.id));
  assert.equal(remainingRecords.length, 2);
  assert.deepEqual(remainingRecords.map((p) => p.slug), ["p2", "p4"]);
});
