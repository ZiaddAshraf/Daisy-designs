import test from "node:test";
import assert from "node:assert/strict";
import {
  getCustomizationFieldLabel,
  formatCustomizationValue,
  formatCustomizationEntries,
} from "../src/lib/customization-formatter.js";

test("getCustomizationFieldLabel formats labels correctly in Arabic and English", () => {
  assert.equal(getCustomizationFieldLabel("child_name", "ar"), "اسم الطفل");
  assert.equal(getCustomizationFieldLabel("child_name", "en"), "Child's Name");
  assert.equal(getCustomizationFieldLabel("parent_phone", "ar"), "موبايل ولي الأمر");
  assert.equal(getCustomizationFieldLabel("parent_phone", "en"), "Parent Phone");
  assert.equal(getCustomizationFieldLabel("design_theme", "ar"), "التصميم");
  assert.equal(getCustomizationFieldLabel("design_theme", "en"), "Design");
});

test("formatCustomizationValue localizes sticker design themes", () => {
  const arDesign = formatCustomizationValue("design_theme", "kpop-demon-hunters", "ar");
  assert.equal(arDesign.displayValue, "كي بوب ديمون هنترز (K-Pop)");
  assert.equal(arDesign.isPhoto, false);

  const enDesign = formatCustomizationValue("design_theme", "kpop-demon-hunters", "en");
  assert.equal(enDesign.displayValue, "K-Pop Demon Hunters");
  assert.equal(enDesign.isPhoto, false);
});

test("formatCustomizationValue detects child photos and creates attachment label", () => {
  const arPhoto = formatCustomizationValue(
    "child_photo",
    "/uploads/customizations/stk_child_abc.webp",
    "ar"
  );
  assert.equal(arPhoto.displayValue, "صورة مرفقة");
  assert.equal(arPhoto.isPhoto, true);
  assert.equal(arPhoto.photoUrl, "/uploads/customizations/stk_child_abc.webp");

  const enPhoto = formatCustomizationValue(
    "child_photo",
    "/uploads/customizations/stk_child_abc.webp",
    "en"
  );
  assert.equal(enPhoto.displayValue, "Photo Attached");
  assert.equal(enPhoto.isPhoto, true);
});

test("formatCustomizationEntries orders and formats all customization fields", () => {
  const rawCustomization = {
    parent_phone: "01012345678",
    child_name: "Younis Mohamed",
    design_theme: "super-cool-dino",
    school_name: "مدرسة النيل",
    class_name: "2B",
  };

  const entriesAr = formatCustomizationEntries(rawCustomization, "ar");
  assert.equal(entriesAr[0].key, "child_name");
  assert.equal(entriesAr[0].label, "اسم الطفل");
  assert.equal(entriesAr[0].displayValue, "Younis Mohamed"); // Preserves case!

  assert.equal(entriesAr[1].key, "design_theme");
  assert.equal(entriesAr[1].displayValue, "ديناصورات مرحة (Dino)");

  assert.equal(entriesAr[2].key, "school_name");
  assert.equal(entriesAr[2].displayValue, "مدرسة النيل");
});

