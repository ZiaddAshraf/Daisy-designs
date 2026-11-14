import test from "node:test";
import assert from "node:assert/strict";
import { validateCustomization } from "../src/lib/customization-validation";
import { checkoutSchema } from "../src/lib/order-validation";
import { formatCustomizationEntries } from "../src/lib/customization-formatter";

test("customization validation accepts child_name and valid Egyptian parent_phone for stories and stickers", () => {
  const fields = [
    {
      key: "child_photo",
      type: "IMAGE" as const,
      required: true,
      maxLength: null,
      options: [],
    },
  ];

  // Story with child_name and photo
  const validStory = validateCustomization(fields, {
    child_name: "زين علي",
    child_photo: "private:story_child_12345.jpg",
  });
  assert.equal(validStory.success, true);
  if (validStory.success) {
    assert.equal(validStory.data?.child_name, "زين علي");
    assert.equal(validStory.data?.child_photo, "private:story_child_12345.jpg");
  }

  // Sticker with child_name, school, and valid parent phone
  const validSticker = validateCustomization([], {
    child_name: "سليم أحمد",
    parent_phone: "01152606234",
    school_name: "مدرسة النيل",
  });
  assert.equal(validSticker.success, true);
  if (validSticker.success) {
    assert.equal(validSticker.data?.child_name, "سليم أحمد");
    assert.equal(validSticker.data?.parent_phone, "01152606234");
  }

  // Invalid Egyptian phone rejected
  const invalidPhone = validateCustomization([], {
    child_name: "سليم أحمد",
    parent_phone: "12345",
  });
  assert.equal(invalidPhone.success, false);
});

test("new ticket and label designs remain orderable while database options are stale", () => {
  const fields = [{
    key: "design_theme",
    type: "SELECT" as const,
    required: true,
    maxLength: 80,
    options: [{ value: "super-cool-dino" }],
  }];
  assert.equal(validateCustomization(fields, { design_theme: "ticket-label-doctor-girl" }).success, true);
  assert.equal(validateCustomization(fields, { design_theme: "ticket-label-not-in-catalog" }).success, false);
});

test("checkoutSchema strictly enforces Egyptian phone validation and COD payment method", () => {
  const validPayload = {
    fullName: "مريم أحمد",
    phone: "01152606234",
    governorate: "القاهرة",
    city: "المعادي",
    address: "شارع النصر عمارة 12 الدور الثالث",
    paymentMethod: "COD" as const,
    items: [
      {
        slug: "custom-printed-tshirt",
        quantity: 1,
      },
    ],
  };

  const parsedValid = checkoutSchema.safeParse(validPayload);
  assert.equal(parsedValid.success, true);

  // Invalid phone rejected
  const parsedInvalidPhone = checkoutSchema.safeParse({
    ...validPayload,
    phone: "00012345",
  });
  assert.equal(parsedInvalidPhone.success, false);

  // Short address rejected
  const parsedShortAddress = checkoutSchema.safeParse({
    ...validPayload,
    address: "hi",
  });
  assert.equal(parsedShortAddress.success, false);

  // Non-COD payment method rejected at this stage
  const parsedBadPayment = checkoutSchema.safeParse({
    ...validPayload,
    paymentMethod: "CARD",
  });
  assert.equal(parsedBadPayment.success, false);
});

test("formatCustomizationEntries formats T-shirt custom_design_text accurately without confusing with storybook", () => {
  const entries = formatCustomizationEntries(
    {
      garment_color: "black",
      garment_size: "6",
      custom_design_text: "بطل المستقبل",
    },
    "ar"
  );

  const designTextEntry = entries.find((e) => e.key === "custom_design_text");
  assert.ok(designTextEntry);
  assert.equal(designTextEntry.label, "وصف فكرة التصميم");
  assert.equal(designTextEntry.displayValue, "بطل المستقبل");
});

test("formatCustomizationEntries redacts private upload keys from public display text", () => {
  const storyEntries = formatCustomizationEntries(
    {
      child_photo: "private:story_child_9999.jpg",
    },
    "ar"
  );
  assert.equal(storyEntries[0]?.displayValue, "صورة مرفقة ومؤمنة");
  assert.equal(storyEntries[0]?.photoUrl, undefined);

  const tshirtEntries = formatCustomizationEntries(
    {
      custom_design_file: "private:tshirt_art_8888.png",
    },
    "ar"
  );
  assert.equal(tshirtEntries[0]?.displayValue, "تصميم مرفق ومؤمن");
  assert.equal(tshirtEntries[0]?.photoUrl, undefined);
});

