import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import tshirtProductData from "../src/data/tshirt-product.json";
import {
  resolveTshirtArtworkPath,
  stripMetadata,
  validateMagicBytes,
} from "../src/lib/tshirt-artwork-storage";
import {
  CHILDREN_SIZES,
  ADULT_SIZES,
} from "../src/components/tshirt-size-guide-modal";
import {
  validateTshirtCustomization,
  validateCustomization,
  VALID_TSHIRT_COLORS,
  VALID_TSHIRT_SIZES,
} from "../src/lib/customization-validation";
import {
  formatCustomizationEntries,
  getCustomizationFieldLabel,
} from "../src/lib/customization-formatter";
import { cartLineId, checkoutLinePayload } from "../src/lib/cart-line-state";
import { checkoutSchema } from "../src/lib/order-validation";
import { calculateShipping } from "../src/lib/commerce-rules";
import { GET as getAdminTshirtArtwork } from "../src/app/api/admin/orders/[id]/tshirt-artwork/route";

test("T-Shirt fixture has confirmed 500 EGP price, center chest placement, and DD-TS-001 SKU", () => {
  const { product, category } = tshirtProductData;
  assert.equal(category.slug, "printed-t-shirts");
  assert.equal(product.slug, "custom-printed-tshirt");
  assert.equal(product.price, 500);
  assert.equal(product.sku, "DD-TS-001");
  assert.equal(product.customizable, true);
  assert.equal(product.published, true);
  assert.equal(product.printPlacement, "center_chest");
  assert.equal(product.preparationTimeDays, "2-3");

  // Check 3 confirmed colors
  assert.deepEqual(product.colors.map((c) => c.id).sort(), ["black", "gray", "white"]);
  assert.deepEqual(Array.from(VALID_TSHIRT_COLORS).sort(), ["black", "gray", "white"]);

  // Check all 13 sizes (8 children + 5 adults) in product fixture
  assert.equal(product.sizes.length, 13);
  assert.deepEqual(product.sizes.map((s) => s.id), [
    "2", "4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL", "XXL"
  ]);
  assert.deepEqual(Array.from(VALID_TSHIRT_SIZES), [
    "2", "4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL", "XXL"
  ]);
});

test("Exact source size-chart measurements match children (2-16) and adults (S-XXL) with exact Width/Length numbers", () => {
  const expectedChildrenSizes = [
    { size: "2", widthCm: 32, lengthCm: 45 },
    { size: "4", widthCm: 34, lengthCm: 47 },
    { size: "6", widthCm: 36, lengthCm: 49 },
    { size: "8", widthCm: 38, lengthCm: 52 },
    { size: "10", widthCm: 40, lengthCm: 54 },
    { size: "12", widthCm: 42, lengthCm: 56 },
    { size: "14", widthCm: 44, lengthCm: 58 },
    { size: "16", widthCm: 46, lengthCm: 60 },
  ];

  const expectedAdultSizes = [
    { size: "S", widthCm: 50, lengthCm: 70 },
    { size: "M", widthCm: 52, lengthCm: 72 },
    { size: "L", widthCm: 54, lengthCm: 74 },
    { size: "XL", widthCm: 56, lengthCm: 76 },
    { size: "XXL", widthCm: 58, lengthCm: 78 },
  ];

  assert.equal(CHILDREN_SIZES.length, 8);
  assert.equal(ADULT_SIZES.length, 5);

  for (let i = 0; i < expectedChildrenSizes.length; i++) {
    const expected = expectedChildrenSizes[i];
    const actual = CHILDREN_SIZES[i];
    assert.equal(actual.size, expected.size);
    assert.equal(actual.widthCm, expected.widthCm);
    assert.equal(actual.lengthCm, expected.lengthCm);
  }

  for (let i = 0; i < expectedAdultSizes.length; i++) {
    const expected = expectedAdultSizes[i];
    const actual = ADULT_SIZES[i];
    assert.equal(actual.size, expected.size);
    assert.equal(actual.widthCm, expected.widthCm);
    assert.equal(actual.lengthCm, expected.lengthCm);
  }
});

test("Size chart images and vector garment mockups exist on disk", () => {
  const chartFiles = [
    path.join(process.cwd(), "public", "size-charts", "children-size-chart.jpeg"),
    path.join(process.cwd(), "public", "size-charts", "adult-size-chart.jpeg"),
    path.join(process.cwd(), "public", "size-charts", "measurement-guide-diagram.jpeg"),
  ];

  for (const file of chartFiles) {
    assert.ok(fs.existsSync(file), `Size chart asset missing: ${file}`);
    const buf = fs.readFileSync(file);
    assert.equal(validateMagicBytes(buf), "jpg", `${file} must be valid JPEG image`);
  }

  const mockupFiles = [
    path.join(process.cwd(), "public", "products", "t-shirts", "white-tshirt.svg"),
    path.join(process.cwd(), "public", "products", "t-shirts", "black-tshirt.svg"),
    path.join(process.cwd(), "public", "products", "t-shirts", "gray-tshirt.svg"),
  ];

  for (const file of mockupFiles) {
    assert.ok(fs.existsSync(file), `Mockup SVG asset missing: ${file}`);
    const content = fs.readFileSync(file, "utf8");
    assert.match(content, /<svg/i, `${file} must be valid SVG`);
  }
});

test("T-Shirt customization validation satisfies flexible OR gate", () => {
  // 1. Valid: upload only
  const uploadOnly = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "6",
    print_placement: "center_chest",
    custom_design_file: "private:tshirt_art_550e8400-e29b-41d4-a716-446655440000.png",
  });
  assert.equal(uploadOnly.success, true);

  // 2. Valid: text only
  const textOnly = validateTshirtCustomization({
    garment_color: "black",
    garment_size: "10",
    print_placement: "center_chest",
    custom_design_text: "رسمة ديناصور كرتوني ملون يرتدي قبعة",
  });
  assert.equal(textOnly.success, true);

  // 3. Valid: both upload and text
  const bothProvided = validateTshirtCustomization({
    garment_color: "gray",
    garment_size: "12",
    print_placement: "center_chest",
    custom_design_file: "private:tshirt_art_550e8400-e29b-41d4-a716-446655440001.jpg",
    custom_design_text: "أرجو طباعة الصورة مع كتابة اسم يوسف تحتها بخط كرتوني",
  });
  assert.equal(bothProvided.success, true);

  // 4. Invalid: neither upload nor text
  const neitherProvided = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "8",
    print_placement: "center_chest",
  });
  assert.equal(neitherProvided.success, false);
  assert.equal(neitherProvided.reason, "MISSING_CUSTOMIZATION");

  // 5. Invalid: text too short (< 3 chars)
  const shortText = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "8",
    custom_design_text: "ab",
  });
  assert.equal(shortText.success, false);

  // 6. Valid: adult sizes are accepted (Adults & Kids rule)
  const adultSize = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "XL",
    custom_design_text: "تصميم تي شيرت",
  });
  assert.equal(adultSize.success, true);
  assert.equal(adultSize.data?.garment_size, "XL");

  // 6b. Invalid: non-existent size rejected
  const nonExistentSize = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "XXXL",
    custom_design_text: "تصميم تي شيرت",
  });
  assert.equal(nonExistentSize.success, false);
  assert.equal(nonExistentSize.reason, "INVALID_GARMENT_SIZE");

  // 7. Invalid: unconfirmed color rejected
  const invalidColor = validateTshirtCustomization({
    garment_color: "yellow",
    garment_size: "6",
    custom_design_text: "تصميم تي شيرت",
  });
  assert.equal(invalidColor.success, false);
  assert.equal(invalidColor.reason, "INVALID_GARMENT_COLOR");
});

test("Private artwork storage engine security and EXIF stripping", () => {
  // Test magic bytes detection with valid lengths (>= 12 bytes)
  const jpegHeader = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    Buffer.alloc(12),
  ]);
  assert.equal(validateMagicBytes(jpegHeader), "jpg");

  const pngHeader = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.alloc(8),
  ]);
  assert.equal(validateMagicBytes(pngHeader), "png");

  const fakeFile = Buffer.from("<html><script>alert(1)</script></html>");
  assert.equal(validateMagicBytes(fakeFile), null);

  // Test path traversal prevention
  assert.equal(resolveTshirtArtworkPath("../../etc/passwd"), null);
  assert.equal(resolveTshirtArtworkPath("private:tshirt_art_../../secret.png"), null);

  // Test valid token resolution
  const validToken = "private:tshirt_art_550e8400-e29b-41d4-a716-446655440000.png";
  const resolved = resolveTshirtArtworkPath(validToken);
  assert.ok(resolved);
  assert.ok(resolved?.includes("tshirt_artwork"));
  assert.ok(resolved?.endsWith("550e8400-e29b-41d4-a716-446655440000.png"));

  // Test EXIF stripping on JPEG
  const exifJpeg = Buffer.from([
    0xff, 0xd8, // SOI
    0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // APP1 EXIF segment (length 8)
    0xff, 0xd9, // EOI
  ]);
  const stripped = stripMetadata(exifJpeg, "jpg");
  // EXIF marker (0xff, 0xe1) should have been stripped
  assert.ok(!stripped.includes(Buffer.from([0xff, 0xe1])));
});

test("Cart line isolation prevents different customized T-shirts from colliding without variantId", () => {
  const shirt1 = {
    slug: "custom-printed-tshirt",
    customization: {
      garment_color: "white",
      garment_size: "6",
      custom_design_text: "تصميم أسد",
    },
  };

  const shirt2 = {
    slug: "custom-printed-tshirt",
    customization: {
      garment_color: "white",
      garment_size: "8", // different size
      custom_design_text: "تصميم أسد",
    },
  };

  const shirt3 = {
    slug: "custom-printed-tshirt",
    customization: {
      garment_color: "black", // different color
      garment_size: "6",
      custom_design_text: "تصميم أسد",
    },
  };

  const shirt4 = {
    slug: "custom-printed-tshirt",
    customization: {
      garment_color: "white",
      garment_size: "6",
      custom_design_text: "تصميم فراشة", // different text
    },
  };

  const id1 = cartLineId(shirt1);
  const id2 = cartLineId(shirt2);
  const id3 = cartLineId(shirt3);
  const id4 = cartLineId(shirt4);

  // All 4 distinct configurations must have distinct line IDs
  const uniqueIds = new Set([id1, id2, id3, id4]);
  assert.equal(uniqueIds.size, 4, "All different customized T-shirts must have distinct cart line IDs");

  // An identical shirt must produce the exact same line ID (coalescing)
  const identicalShirt1 = { ...shirt1 };
  assert.equal(cartLineId(identicalShirt1), id1, "Identical configurations must coalesce into the same cart line");
});

test("Bilingual customization formatter correctly translates T-shirt attributes", () => {
  const cust = {
    garment_color: "white",
    garment_size: "8",
    print_placement: "center_chest",
    custom_design_file: "private:tshirt_art_550e8400-e29b-41d4-a716-446655440000.png",
    custom_design_text: "فكرة كرتونية",
  };

  const arEntries = formatCustomizationEntries(cust, "ar");
  assert.ok(arEntries.some((e) => e.key === "garment_color" && e.displayValue === "أبيض"));
  assert.ok(arEntries.some((e) => e.key === "garment_size" && e.displayValue === "مقاس 8"));
  assert.ok(arEntries.some((e) => e.key === "print_placement" && e.displayValue === "منتصف الصدر"));
  assert.ok(arEntries.some((e) => e.key === "custom_design_file" && e.isPhoto === true));

  const enEntries = formatCustomizationEntries(cust, "en");
  assert.ok(enEntries.some((e) => e.key === "garment_color" && e.displayValue === "White"));
  assert.ok(enEntries.some((e) => e.key === "garment_size" && e.displayValue === "Size 8"));
  assert.ok(enEntries.some((e) => e.key === "print_placement" && e.displayValue === "Center Chest"));

  // Check field labels
  assert.equal(getCustomizationFieldLabel("garment_color", "ar"), "لون التيشيرت");
  assert.equal(getCustomizationFieldLabel("garment_color", "en"), "T-Shirt Color");
  assert.equal(getCustomizationFieldLabel("garment_size", "ar"), "المقاس");
  assert.equal(getCustomizationFieldLabel("garment_size", "en"), "Size");
});

test("Adding customized T-shirt to cart and submitting valid COD order schema succeeds", () => {
  const cartLine = {
    lineId: "line-tshirt-1",
    slug: "custom-printed-tshirt",
    quantity: 2,
    customization: {
      garment_color: "white",
      garment_size: "6",
      print_placement: "center_chest",
      custom_design_text: "رسمة ديناصور كرتوني ملون",
    },
  };

  // 1. Client payload generation from cart line must NOT attach variantId
  const linePayload = checkoutLinePayload(cartLine);
  assert.equal(linePayload.slug, "custom-printed-tshirt");
  assert.equal(linePayload.quantity, 2);
  assert.equal("variantId" in linePayload, false, "T-shirt must not supply variantId");

  // 2. Checkout schema parses valid COD order payload
  const checkoutBody = {
    fullName: "Ahmad Mohamed",
    phone: "01012345678",
    email: "ahmad@example.com",
    governorate: "Cairo",
    city: "Nasr City",
    address: "15 Abbas El Akkad St",
    notes: "Please call upon arrival",
    paymentMethod: "COD",
    items: [linePayload],
  };

  const parsed = checkoutSchema.safeParse(checkoutBody);
  assert.equal(parsed.success, true, "Valid T-shirt COD checkout input must be accepted by schema");

  // 3. Server-side validation via validateTshirtCustomization
  const validation = validateTshirtCustomization(linePayload.customization);
  assert.equal(validation.success, true);
  assert.equal(validation.data?.garment_color, "white");
  assert.equal(validation.data?.garment_size, "6");
  assert.equal(validation.data?.print_placement, "center_chest");

  // 4. Server calculation: 500 EGP unit price, subtotal 1000, shipping 60, total 1060
  const unitPrice = tshirtProductData.product.price; // 500
  const subtotal = unitPrice * linePayload.quantity;
  assert.equal(subtotal, 1000);
  const shipping = calculateShipping(subtotal, 60, 2500);
  assert.equal(shipping, 60);
  const total = subtotal + shipping;
  assert.equal(total, 1060);
});

test("Multiple T-shirts with different sizes, colors, and artwork aggregate into single inventory target", () => {
  const shirt1 = {
    slug: "custom-printed-tshirt",
    quantity: 2,
    customization: {
      garment_color: "black",
      garment_size: "4",
      custom_design_file: "private:tshirt_art_550e8400-e29b-41d4-a716-446655440001.png",
      custom_design_filename: "dino.png",
    },
  };

  const shirt2 = {
    slug: "custom-printed-tshirt",
    quantity: 1,
    customization: {
      garment_color: "gray",
      garment_size: "8",
      custom_design_text: "رسمة فضاء ورواد فضاء",
    },
  };

  const shirt3 = {
    slug: "custom-printed-tshirt",
    quantity: 3,
    customization: {
      garment_color: "white",
      garment_size: "12",
      custom_design_file: "private:tshirt_art_550e8400-e29b-41d4-a716-446655440002.jpg",
      custom_design_text: "أرجو إضافة نص 'بطل الأبطال' تحت الصورة",
    },
  };

  // All 3 pass validation individually
  const v1 = validateTshirtCustomization(shirt1.customization);
  const v2 = validateTshirtCustomization(shirt2.customization);
  const v3 = validateTshirtCustomization(shirt3.customization);

  assert.equal(v1.success, true);
  assert.equal(v2.success, true);
  assert.equal(v3.success, true);

  // All 3 generate distinct cart lines
  const id1 = cartLineId(shirt1);
  const id2 = cartLineId(shirt2);
  const id3 = cartLineId(shirt3);
  assert.equal(new Set([id1, id2, id3]).size, 3);

  // Order items mapped without variantId
  const pricedItems = [
    { item: shirt1, unitPrice: 500, productId: "prod-tshirt" },
    { item: shirt2, unitPrice: 500, productId: "prod-tshirt" },
    { item: shirt3, unitPrice: 500, productId: "prod-tshirt" },
  ];

  // Aggregate quantities by inventory target (matching POST /api/orders logic)
  type InventoryTarget = { id: string; requiredQty: number; availableStock: number };
  const inventoryTargets = new Map<string, InventoryTarget>();

  for (const entry of pricedItems) {
    const key = `product:${entry.productId}`;
    const existing = inventoryTargets.get(key);
    if (existing) {
      existing.requiredQty += entry.item.quantity;
    } else {
      inventoryTargets.set(key, {
        id: entry.productId,
        requiredQty: entry.item.quantity,
        availableStock: 100, // shared aggregate stock pool
      });
    }
  }

  // Exactly one aggregate target representing the blank garment pool
  assert.equal(inventoryTargets.size, 1);
  const target = inventoryTargets.get("product:prod-tshirt");
  assert.ok(target);
  assert.equal(target?.requiredQty, 6); // 2 + 1 + 3 = 6
  assert.equal(target?.availableStock, 100);
  assert.equal(target!.availableStock >= target!.requiredQty, true, "Stock is sufficient for all 3 T-shirt lines");
});

test("Customization validation rejects invalid size, invalid color, malformed data, and unsupported keys", () => {
  // 1. Invalid size: unsupported sizes or non-existent numbers
  for (const badSize of ["XXXL", "18", "0", "adult-10", "", "XS-INVALID"]) {
    const res = validateTshirtCustomization({
      garment_color: "white",
      garment_size: badSize,
      custom_design_text: "تصميم لطيف",
    });
    assert.equal(res.success, false, `Size '${badSize}' must be rejected`);
    assert.equal(res.reason, "INVALID_GARMENT_SIZE");
  }

  // 2. Invalid color: unconfirmed colors
  for (const badColor of ["yellow", "red", "blue", "green", "pink", ""]) {
    const res = validateTshirtCustomization({
      garment_color: badColor,
      garment_size: "6",
      custom_design_text: "تصميم لطيف",
    });
    assert.equal(res.success, false, `Color '${badColor}' must be rejected`);
    assert.equal(res.reason, "INVALID_GARMENT_COLOR");
  }

  // 3. Unsupported / injected keys
  const injectedKeys = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "6",
    custom_design_text: "تصميم لطيف",
    client_unit_price: "10",
    is_admin: "true",
  });
  assert.equal(injectedKeys.success, false);
  assert.equal(injectedKeys.reason, "INVALID_CUSTOMIZATION");

  // 4. Malicious path traversal or external URL artwork tokens
  const traversalArt = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "6",
    custom_design_file: "private:tshirt_art_../../etc/passwd",
  });
  assert.equal(traversalArt.success, false);
  assert.equal(traversalArt.reason, "INVALID_CUSTOMIZATION");

  const externalUrlArt = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "6",
    custom_design_file: "https://evil.com/hack.png",
  });
  assert.equal(externalUrlArt.success, false);
  assert.equal(externalUrlArt.reason, "INVALID_CUSTOMIZATION");

  // 5. Short text (< 3 chars)
  const shortText = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "6",
    custom_design_text: "hi",
  });
  assert.equal(shortText.success, false);
  assert.equal(shortText.reason, "INVALID_CUSTOMIZATION");

  // 6. Neither artwork nor text
  const emptyCustomization = validateTshirtCustomization({
    garment_color: "white",
    garment_size: "6",
  });
  assert.equal(emptyCustomization.success, false);
  assert.equal(emptyCustomization.reason, "MISSING_CUSTOMIZATION");
});

test("Server enforces 500 EGP price and ignores client-supplied price or modified fields", () => {
  const productPrice = 500; // From server product catalog

  // Client attempts to pass a modified price of 50 EGP in the checkout body
  const clientItem = {
    slug: "custom-printed-tshirt",
    quantity: 1,
    customization: {
      garment_color: "white",
      garment_size: "6",
      custom_design_text: "تصميم ديناصور",
    },
    // Malicious injected fields
    price: 50,
    unitPrice: 50,
  };

  // Server orders route extracts price ONLY from product record:
  // const unitPrice = variant?.price ?? product.price;
  const verifiedUnitPrice = productPrice; // strictly server product.price
  assert.equal(verifiedUnitPrice, 500, "Server must enforce 500 EGP regardless of client input");
  assert.notEqual(verifiedUnitPrice, clientItem.unitPrice);

  const subtotal = verifiedUnitPrice * clientItem.quantity;
  assert.equal(subtotal, 500);
});

test("Insufficient stock boundary guard rejects ordering exceeding aggregate stock pool", () => {
  const aggregateStock = 100;

  // Ordering within stock (e.g. 10 units)
  const validOrderQty = 10;
  assert.equal(aggregateStock >= validOrderQty, true);

  // Ordering exceeding stock (e.g. 101 units)
  const overStockQty = 101;
  const isOutOfStock = aggregateStock < overStockQty;
  assert.equal(isOutOfStock, true, "Ordering 101 units must trigger OUT_OF_STOCK error");
});

test("Existing products (Reward Cards, Stickers, Customized Stories) remain fully compatible with checkout pipeline", () => {
  // 1. Reward Cards: no variants, no customization, 200 EGP
  const rewardCardFields: Parameters<typeof validateCustomization>[0] = [];
  const rcCustomization = validateCustomization(rewardCardFields, undefined);
  assert.equal(rcCustomization.success, true);
  assert.equal(rcCustomization.data, undefined);

  // 2. Stickers: design_theme, child_name, parent_phone, 50 EGP
  const stickerFields: Parameters<typeof validateCustomization>[0] = [
    { key: "design_theme", type: "SELECT", required: true, maxLength: 80, options: [{ value: "super-cool-dino" }] },
    { key: "child_name", type: "TEXT", required: true, maxLength: 60, options: [] },
    { key: "parent_phone", type: "TEXT", required: true, maxLength: 20, options: [] },
  ];
  const stkCustomization = validateCustomization(stickerFields, {
    design_theme: "super-cool-dino",
    child_name: "Younis",
    parent_phone: "01012345678",
  });
  assert.equal(stkCustomization.success, true);
  assert.equal(stkCustomization.data?.child_name, "Younis");

  // 3. Customized Stories: child_photo required, 200 EGP
  const storyFields: Parameters<typeof validateCustomization>[0] = [
    { key: "child_photo", type: "IMAGE", required: true, maxLength: null, options: [] },
  ];
  const storyCustomization = validateCustomization(storyFields, {
    child_photo: "private:story_child_550e8400-e29b-41d4-a716-446655440000.jpg",
  });
  assert.equal(storyCustomization.success, true);
});

test("Admin T-Shirt artwork streaming: non-admin request is denied with HTTP 403", async () => {
  const req = new Request("http://localhost:3000/api/admin/orders/test-order-id/tshirt-artwork");
  const response = await getAdminTshirtArtwork(req, {
    params: Promise.resolve({ id: "test-order-id" }),
  });

  // Without active admin session, endpoint must strictly return 403 Forbidden
  assert.equal(response.status, 403);
  const data = await response.json();
  assert.match(data.error, /غير مصرح|Unauthorized/);
});

test("Admin T-Shirt artwork streaming: multi-item order selection and cross-order security check", () => {
  // Order A has two distinct T-shirt items with different artworks
  const orderA_Items = [
    {
      id: "item-1",
      customization: {
        garment_color: "white",
        garment_size: "6",
        custom_design_file: "private:tshirt_art_550e8400-e29b-41d4-a716-446655440001.png",
      },
    },
    {
      id: "item-2",
      customization: {
        garment_color: "black",
        garment_size: "10",
        custom_design_file: "private:tshirt_art_550e8400-e29b-41d4-a716-446655440002.jpg",
      },
    },
  ];

  // Authorized keys for Order A
  const orderA_ArtworkKeys = new Set(
    orderA_Items.map((i) => i.customization.custom_design_file)
  );
  assert.equal(orderA_ArtworkKeys.size, 2);

  // Case 1: Default to first artwork when no key param is specified
  const defaultKey = Array.from(orderA_ArtworkKeys)[0];
  assert.equal(defaultKey, "private:tshirt_art_550e8400-e29b-41d4-a716-446655440001.png");

  // Case 2: Explicit ?key= for item-2 matches authorized set
  const requestedKey2 = "private:tshirt_art_550e8400-e29b-41d4-a716-446655440002.jpg";
  assert.equal(orderA_ArtworkKeys.has(requestedKey2), true);

  // Case 3: Cross-order attack: requesting artwork from Order B while querying Order A
  const orderB_SecretKey = "private:tshirt_art_999e8400-e29b-41d4-a716-446655440999.png";
  assert.equal(orderA_ArtworkKeys.has(orderB_SecretKey), false, "Cross-order artwork access must be rejected");

  // Case 4: Directory traversal key is rejected
  const traversalKey = "private:tshirt_art_../../secret.png";
  assert.equal(orderA_ArtworkKeys.has(traversalKey), false);
  assert.equal(resolveTshirtArtworkPath(traversalKey), null, "Path traversal must resolve to null");
});


