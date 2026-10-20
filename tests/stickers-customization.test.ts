import assert from "node:assert/strict";
import test from "node:test";
import { validateCustomization, validateEgyptianPhone } from "@/lib/customization-validation";
import { cartLineId } from "@/lib/cart-line-state";
import stickersData from "@/data/stickers-product.json";

test("validates Egyptian mobile numbers correctly", () => {
  // Valid numbers
  assert.equal(validateEgyptianPhone("01012345678"), true);
  assert.equal(validateEgyptianPhone("01112345678"), true);
  assert.equal(validateEgyptianPhone("01212345678"), true);
  assert.equal(validateEgyptianPhone("01512345678"), true);
  assert.equal(validateEgyptianPhone("+201012345678"), true);
  assert.equal(validateEgyptianPhone("201112345678"), true);
  assert.equal(validateEgyptianPhone("010 1234 5678"), true);
  assert.equal(validateEgyptianPhone("010-1234-5678"), true);

  // Invalid numbers
  assert.equal(validateEgyptianPhone("01312345678"), false); // Invalid prefix (013)
  assert.equal(validateEgyptianPhone("01912345678"), false); // Invalid prefix (019)
  assert.equal(validateEgyptianPhone("0101234567"), false);  // Only 10 digits
  assert.equal(validateEgyptianPhone("010123456789"), false); // 12 digits
  assert.equal(validateEgyptianPhone("123456789"), false);
  assert.equal(validateEgyptianPhone("abcdefghijk"), false);
});

test("preserves exact case for English child name in customization", () => {
  const fields = [
    { key: "design_theme", type: "SELECT" as const, required: true, maxLength: 80, options: [{ value: "super-cool-dino" }] },
    { key: "child_name", type: "TEXT" as const, required: true, maxLength: 60, options: [] },
    { key: "parent_phone", type: "TEXT" as const, required: true, maxLength: 20, options: [] },
  ];

  const result = validateCustomization(fields, {
    design_theme: "super-cool-dino",
    child_name: "Younis Mohamed Hafez",
    parent_phone: "01012345678",
  });

  assert.equal(result.success, true);
  if (result.success && result.data) {
    assert.equal(result.data.child_name, "Younis Mohamed Hafez");
    assert.notEqual(result.data.child_name, "younis mohamed hafez");
    assert.notEqual(result.data.child_name, "YOUNIS MOHAMED HAFEZ");
  }
});

test("cartLineId isolates stickers by design and child name", () => {
  const line1 = cartLineId({
    slug: stickersData.product.slug,
    customization: {
      design_theme: "super-cool-dino",
      child_name: "Younis Mohamed",
      parent_phone: "01012345678",
    },
  });

  const line2 = cartLineId({
    slug: stickersData.product.slug,
    customization: {
      design_theme: "super-cool-dino",
      child_name: "Omar Ahmed", // Different child name
      parent_phone: "01012345678",
    },
  });

  const line3 = cartLineId({
    slug: stickersData.product.slug,
    customization: {
      design_theme: "kuromi-sanrio", // Different design
      child_name: "Younis Mohamed",
      parent_phone: "01012345678",
    },
  });

  const line1Duplicate = cartLineId({
    slug: stickersData.product.slug,
    customization: {
      design_theme: "super-cool-dino",
      child_name: "Younis Mohamed",
      parent_phone: "01012345678",
    },
  });

  assert.notEqual(line1, line2, "Different child names must have different line IDs");
  assert.notEqual(line1, line3, "Different designs must have different line IDs");
  assert.equal(line1, line1Duplicate, "Identical configurations must share the same line ID");
});

test("sticker unit price is strictly 50 EGP and calculates total correctly", () => {
  const unitPrice = stickersData.product.price;
  assert.equal(unitPrice, 50, "Sticker unit price must be 50 EGP");

  const qty = 3;
  const lineTotal = unitPrice * qty;
  assert.equal(lineTotal, 150, "3 sheets must equal 150 EGP");
});

test("custom sticker design at index 0 validates custom design text correctly", () => {
  const firstDesign = stickersData.product.designs[0];
  assert.equal(firstDesign.id, 0);
  assert.equal(firstDesign.slug, "custom-design");
  assert.equal(firstDesign.isCustom, true);

  const fields = [
    { key: "design_theme", type: "SELECT" as const, required: true, maxLength: 80, options: [{ value: "custom-design" }] },
    { key: "custom_design_text", type: "TEXT" as const, required: false, maxLength: 500, options: [] },
    { key: "child_name", type: "TEXT" as const, required: true, maxLength: 80, options: [] },
    { key: "parent_phone", type: "TEXT" as const, required: false, maxLength: 20, options: [] },
  ];

  const result = validateCustomization(fields, {
    design_theme: "custom-design",
    custom_design_text: "رسمة ديناصور مخصص يرتدي نظارة شمسية",
    child_name: "سليم أحمد",
    parent_phone: "01012345678",
  });

  assert.equal(result.success, true);
  if (result.success && result.data) {
    assert.equal(result.data.custom_design_text, "رسمة ديناصور مخصص يرتدي نظارة شمسية");
    assert.equal(result.data.child_name, "سليم أحمد");
  }
});


