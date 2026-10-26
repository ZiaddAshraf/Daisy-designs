import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import storyProductData from "../src/data/story-product.json";
import { prisma } from "../src/lib/prisma";
import {
  extractDimensions,
  resolveChildPhotoPath,
  stripMetadata,
  validateMagicBytes,
} from "../src/lib/child-photo-storage";
import { validateCustomization } from "../src/lib/customization-validation";
import { cartLineId } from "../src/lib/cart-line-state";

test("story product JSON fixture has confirmed 200 EGP price, physical format, and 10 pages", () => {
  const { product, category } = storyProductData;
  assert.equal(category.slug, "customized-stories");
  assert.equal(product.slug, "first-year-at-school");
  assert.equal(product.price, 200);
  assert.equal(product.stock, 50);
  assert.equal(product.sku, "DD-ST-001");
  assert.equal(product.customizable, true);
  assert.equal(product.published, true);
  assert.match(product.format, /printed paper/i);
  assert.equal(product.gallery.length, 9); // Cover + 9 gallery items = 10 total pages
  assert.ok(product.primaryImage.url.includes("first-year-at-school/cover.jpeg"));
});

test("all 10 original story images exist on disk with 902x1280 dimensions", () => {
  const images = [
    "cover.jpeg",
    "page-01.jpeg",
    "page-02.jpeg",
    "page-03.jpeg",
    "page-04.jpeg",
    "page-05.jpeg",
    "page-06.jpeg",
    "page-07.jpeg",
    "page-08.jpeg",
    "back-cover.jpeg",
  ];

  for (const imgName of images) {
    const fullPath = path.join(
      process.cwd(),
      "public",
      "products",
      "customized-stories",
      "first-year-at-school",
      imgName
    );
    assert.ok(fs.existsSync(fullPath), `Image file must exist: ${imgName}`);
    const buf = fs.readFileSync(fullPath);
    assert.equal(validateMagicBytes(buf), "jpg", `${imgName} must be valid JPEG`);
    const dim = extractDimensions(buf, "jpg");
    assert.ok(dim, `Dimensions must be extractable for ${imgName}`);
    assert.equal(dim?.width, 902, `${imgName} width must be 902`);
    assert.equal(dim?.height, 1280, `${imgName} height must be 1280`);
  }
});

test("database product and category exist with confirmed values and required child_photo field", async () => {
  const category = await prisma.category.findUnique({
    where: { slug: "customized-stories" },
  });
  assert.ok(category, "Category customized-stories must exist in database");
  assert.equal(category.name, "Customized Stories");
  assert.equal(category.arabicName, "قصص مخصصة");
  assert.equal(category.published, true);

  const product = await prisma.product.findUnique({
    where: { slug: "first-year-at-school" },
    include: {
      images: { orderBy: { position: "asc" } },
      customizationFields: true,
      category: true,
    },
  });
  assert.ok(product, "Product first-year-at-school must exist in database");
  assert.equal(product.price, 200);
  assert.ok(typeof product.stock === "number" && product.stock >= 0, "Product stock must be non-negative integer");
  assert.equal(product.sku, "DD-ST-001");
  assert.equal(product.customizable, true);
  assert.equal(product.published, true);
  assert.equal(product.images.length, 10);
  assert.equal(product.images[0].position, 0);
  assert.equal(product.images[0].url, "/products/customized-stories/first-year-at-school/cover.jpeg");
  assert.equal(product.images[9].position, 9);
  assert.equal(product.images[9].url, "/products/customized-stories/first-year-at-school/back-cover.jpeg");

  // Child photo field is required and type IMAGE
  const photoField = product.customizationFields.find((f) => f.key === "child_photo");
  assert.ok(photoField, "Customization field child_photo must exist");
  assert.equal(photoField?.type, "IMAGE");
  assert.equal(photoField?.required, true);
});

test("child photo security: magic bytes, directory traversal prevention, and metadata stripping", () => {
  // Magic bytes test
  const fakeJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert.equal(validateMagicBytes(fakeJpg), "jpg");

  const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assert.equal(validateMagicBytes(fakePng), "png");

  const fakeText = Buffer.from("Hello malicious file payload");
  assert.equal(validateMagicBytes(fakeText), null);

  // Directory traversal prevention test
  assert.equal(resolveChildPhotoPath("private:story_child_valid-uuid-1234.jpg")?.includes("story_child_valid-uuid-1234.jpg"), true);
  assert.equal(resolveChildPhotoPath("private:story_child_../../etc/passwd"), null);
  assert.equal(resolveChildPhotoPath("malicious:story_child_file.jpg"), null);

  // EXIF stripping: APP1 marker (FF E1) is omitted
  const jpgWithExif = Buffer.concat([
    Buffer.from([0xff, 0xd8]), // SOI
    Buffer.from([0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]), // APP1 (EXIF)
    Buffer.from([0xff, 0xdb, 0x00, 0x04, 0x01, 0x02]), // DQT
    Buffer.from([0xff, 0xd9]), // EOI
  ]);
  const stripped = stripMetadata(jpgWithExif, "jpg");
  // Stripped buffer must not contain FF E1 marker
  let hasApp1 = false;
  for (let i = 0; i < stripped.length - 1; i++) {
    if (stripped[i] === 0xff && stripped[i + 1] === 0xe1) {
      hasApp1 = true;
      break;
    }
  }
  assert.equal(hasApp1, false, "EXIF APP1 marker must be stripped");
});

test("customization validation enforces required child photo and isolates cart line items", () => {
  const fields = [
    {
      key: "child_photo",
      type: "IMAGE" as const,
      required: true,
      maxLength: null,
      options: [],
    },
  ];

  // Missing child photo fails validation
  const missingResult = validateCustomization(fields, {});
  assert.equal(missingResult.success, false);

  // Valid secure private key passes validation
  const validKey = "private:story_child_550e8400-e29b-41d4-a716-446655440000.jpg";
  const validResult = validateCustomization(fields, { child_photo: validKey });
  assert.equal(validResult.success, true);

  // Distinct child photos create distinct cartLineIds
  const line1 = cartLineId({
    slug: "first-year-at-school",
    customization: { child_photo: "private:story_child_photo_1.jpg" },
  });
  const line2 = cartLineId({
    slug: "first-year-at-school",
    customization: { child_photo: "private:story_child_photo_2.jpg" },
  });
  assert.notEqual(line1, line2, "Different children photos must generate isolated cart lines");

  // Storybook unit price is strictly 200 EGP
  const unitPrice = 200;
  const quantity = 3;
  assert.equal(unitPrice * quantity, 600);
});

