import assert from "node:assert/strict";
import test from "node:test";
import { validateCustomization, validateEgyptianPhone, validateStickerPackageCustomization } from "@/lib/customization-validation";
import { addStickerDesign, parseStickerMix, serializeStickerMix } from "@/lib/sticker-package-mix";
import { formatCustomizationValue } from "@/lib/customization-formatter";
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
  assert.equal(validateEgyptianPhone("٠١٠ ١٢٣٤ ٥٦٧٨"), true);
  assert.equal(validateEgyptianPhone("00201012345678"), true);
  assert.equal(validateEgyptianPhone("010+12345678"), false);
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

test("sticker unit price is 300 EGP for the combined package and calculates total correctly", () => {
  const unitPrice = stickersData.product.price;
  assert.equal(unitPrice, 300, "Sticker unit price must be 300 EGP");

  const qty = 3;
  const lineTotal = unitPrice * qty;
  assert.equal(lineTotal, 900, "3 combined packages must equal 900 EGP");
});

test("a sticker pack can contain several designs with exact ticket and label totals", () => {
  assert.deepEqual(addStickerDesign({ "super-cool-dino": 20 }, "kuromi-sanrio", 20), { "super-cool-dino": 19, "kuromi-sanrio": 1 });
  assert.deepEqual(addStickerDesign({ "super-cool-dino": 18 }, "kuromi-sanrio", 20), { "super-cool-dino": 18, "kuromi-sanrio": 1 });
  const fields = [
    { key: "design_theme", type: "SELECT" as const, required: true, maxLength: 80, options: [{ value: "super-cool-dino" }] },
    { key: "child_name", type: "TEXT" as const, required: true, maxLength: 80, options: [] },
  ];
  const ticketMix = serializeStickerMix({ "super-cool-dino": 12, "kuromi-sanrio": 8 });
  const labelMix = serializeStickerMix({ "super-cool-dino": 10, "kuromi-sanrio": 15 });
  const input = { design_theme: "super-cool-dino", child_name: "Omar", ticket_designs: ticketMix, label_designs: labelMix };
  const combined = validateStickerPackageCustomization(fields, input, "DD-STK-050-COMBINED");
  assert.equal(combined.success, true);
  if (combined.success) {
    assert.deepEqual(parseStickerMix(combined.data?.ticket_designs, 20), { "kuromi-sanrio": 8, "super-cool-dino": 12 });
    assert.match(formatCustomizationValue("label_designs", combined.data?.label_designs ?? "", "ar").displayValue, /15/);
  }
  const ticketsOnly = validateStickerPackageCustomization(fields, { design_theme: "super-cool-dino", child_name: "Omar", ticket_designs: ticketMix }, "DD-STK-050-TICKETS");
  const labelsOnly = validateStickerPackageCustomization(fields, { design_theme: "super-cool-dino", child_name: "Omar", label_designs: labelMix }, "DD-STK-050-LABELS");
  assert.equal(ticketsOnly.success, true);
  assert.equal(labelsOnly.success, true);
  assert.equal(validateStickerPackageCustomization(fields, { ...input, ticket_designs: serializeStickerMix({ "super-cool-dino": 19 }) }, "DD-STK-050-COMBINED").success, false);
  assert.equal(validateStickerPackageCustomization(fields, input, "DD-STK-050-TICKETS").success, false);
  assert.equal(validateStickerPackageCustomization(fields, { ...input, label_designs: "" }, "DD-STK-050-COMBINED").success, false);
  assert.equal(validateStickerPackageCustomization(fields, { ...input, ticket_designs: JSON.stringify([["unknown", 20]]) }, "DD-STK-050-COMBINED").success, false);
  assert.equal(validateStickerPackageCustomization(fields, { ...input, ticket_designs: JSON.stringify([["super-cool-dino", 10], ["super-cool-dino", 10]]) }, "DD-STK-050-COMBINED").success, false);
  assert.equal(validateStickerPackageCustomization(fields, { ...input, ticket_designs: serializeStickerMix({ "super-cool-dino": 19, "custom-design": 1 }) }, "DD-STK-050-COMBINED").success, false);
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


