import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWhatsAppOrderMessage,
  getWhatsAppOrderUrl,
  getStoreWhatsAppNumber,
  sanitizeCustomizationForWhatsApp,
  type OrderConfirmationData,
} from "../src/lib/whatsapp-order-message";

const mockOrder: OrderConfirmationData = {
  number: "ST-20261108ABCDEF12",
  total: 550,
  status: "PENDING",
  paymentStatus: "PENDING",
  paymentMethod: "COD",
  notes: "رقم بديل/واتساب: 01012345678 | الاتصال قبل الوصول",
  shippingAddress: {
    fullName: "سارة محمود",
    phone: "01152606234",
    email: "sara@example.com",
    governorate: "القاهرة",
    city: "المعادي",
    address: "شارع النصر عمارة 15 الدور الرابع",
  },
  items: [
    {
      productName: "تيشيرت قطن فاخر مطبوع",
      quantity: 1,
      unitPrice: 450,
      customization: {
        garment_color: "white",
        garment_size: "8",
        print_placement: "center_chest",
        custom_design_file: "private:tshirt_art_test_secret_12345.png",
        custom_design_filename: "my_art.png",
        custom_design_text: "بطل مصر القادم",
      },
    },
    {
      productName: "استيكرات مدرسية مقاومة للماء",
      quantity: 2,
      unitPrice: 50,
      customization: {
        child_name: "زين أحمد",
        school_name: "مدرسة الأمل",
        grade: "الصف الثاني",
        design_theme: "superman-city-hero",
      },
    },
  ],
};

test("buildWhatsAppOrderMessage in Arabic includes all required order and customer fields", () => {
  const message = buildWhatsAppOrderMessage(mockOrder, "ar");

  // 1. Order reference
  assert.ok(message.includes("ST-20261108ABCDEF12"), "Must include order number");

  // 2. Customer details
  assert.ok(message.includes("سارة محمود"), "Must include customer name");
  assert.ok(message.includes("01152606234"), "Must include customer phone");
  assert.ok(message.includes("sara@example.com"), "Must include customer email");

  // 3. Delivery address and notes
  assert.ok(message.includes("القاهرة - المعادي - شارع النصر عمارة 15 الدور الرابع"), "Must include full address");
  assert.ok(message.includes("01012345678"), "Must include notes / backup phone");

  // 4. Products and quantities
  assert.ok(message.includes("تيشيرت قطن فاخر مطبوع (الكمية: 1)"), "Must include t-shirt line");
  assert.ok(message.includes("استيكرات مدرسية مقاومة للماء (الكمية: 2)"), "Must include sticker line");

  // 5. Customization details
  assert.ok(message.includes("أبيض"), "Must include color");
  assert.ok(message.includes("مقاس 8"), "Must include size");
  assert.ok(message.includes("بطل مصر القادم"), "Must include design text");
  assert.ok(message.includes("زين أحمد"), "Must include child name");
  assert.ok(message.includes("مدرسة الأمل"), "Must include school name");

  // 6. Payment method and total
  assert.ok(message.includes("الدفع عند الاستلام (COD)"), "Must state COD payment method");
  assert.ok(message.includes("٥٥٠ ج.م"), "Must include formatted price in Arabic");
});

test("buildWhatsAppOrderMessage in English includes all required fields", () => {
  const message = buildWhatsAppOrderMessage(mockOrder, "en");

  assert.ok(message.includes("ST-20261108ABCDEF12"));
  assert.ok(message.includes("سارة محمود"));
  assert.ok(message.includes("01152606234"));
  assert.ok(message.includes("Cash on Delivery (COD)"));
  assert.ok(message.includes("550 EGP"));
  assert.ok(message.includes("Qty: 1"));
});

test("Security & Privacy Invariant: Private uploaded keys and raw URLs are never leaked in WhatsApp messages", () => {
  const message = buildWhatsAppOrderMessage(mockOrder, "ar");

  // Never include private storage keys
  assert.equal(message.includes("private:tshirt_art_"), false, "Private artwork key must not be exposed");
  assert.equal(message.includes("test_secret_12345"), false, "Secret identifier must not be exposed");
  assert.equal(message.includes("custom_design_filename"), false, "Internal key name must not be exposed");

  // Must include sanitized reassurance
  assert.ok(message.includes("تصميم مرفق ومؤمن"), "Must show sanitized design attachment text");

  // Story with child photo
  const storyOrder: OrderConfirmationData = {
    number: "ST-STORY-1234",
    total: 390,
    shippingAddress: { fullName: "أحمد", phone: "01000000000" },
    items: [
      {
        productName: "قصة أطفال مخصصة",
        quantity: 1,
        unitPrice: 390,
        customization: {
          child_name: "فريدة",
          child_photo: "private:story_child_987654321.png",
        },
      },
    ],
  };

  const storyMsg = buildWhatsAppOrderMessage(storyOrder, "ar");
  assert.equal(storyMsg.includes("private:story_child_"), false, "Private photo key must not be exposed");
  assert.equal(storyMsg.includes("987654321"), false, "Photo identifier must not be exposed");
  assert.ok(storyMsg.includes("صورة مرفقة ومؤمنة"), "Must show sanitized photo attachment text");
});

test("getStoreWhatsAppNumber defaults to 201152606234 if unconfigured", () => {
  const original = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  assert.equal(getStoreWhatsAppNumber(), "201152606234");
  if (original) process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = original;
});

test("sanitizeCustomizationForWhatsApp filters out private keys and returns formatted string", () => {
  const result = sanitizeCustomizationForWhatsApp(
    {
      garment_color: "white",
      garment_size: "6",
      custom_design_file: "private:tshirt_art_secret.png",
      custom_design_filename: "artwork.png",
    },
    "ar"
  );
  assert.ok(result.includes("أبيض"));
  assert.ok(result.includes("مقاس 6"));
  assert.ok(result.includes("تصميم مرفق ومؤمن"));
  assert.equal(result.includes("private:"), false);
  assert.equal(result.includes("custom_design_filename"), false);
});

test("getWhatsAppOrderUrl generates a valid encoded wa.me URL", () => {
  const url = getWhatsAppOrderUrl(mockOrder, "ar", "201152606234");
  assert.ok(url.startsWith("https://wa.me/201152606234?text="));
  const decoded = decodeURIComponent(url.replace("https://wa.me/201152606234?text=", ""));
  assert.ok(decoded.includes("ST-20261108ABCDEF12"));
  assert.ok(decoded.includes("سارة محمود"));
});
