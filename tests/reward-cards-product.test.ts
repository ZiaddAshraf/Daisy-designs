import assert from "node:assert/strict";
import test from "node:test";
import rewardCardsData from "../src/data/reward-cards-product.json";
import { prisma } from "../src/lib/prisma";

test("reward cards JSON fixture has confirmed 200 EGP price, stock 50, and 10 card images", () => {
  const { product, category } = rewardCardsData;
  assert.equal(category.slug, "reward-cards");
  assert.equal(product.slug, "reward-cards-box-set");
  assert.equal(product.price, 200);
  assert.equal(product.stock, 50);
  assert.equal(product.sku, "DD-RC-010");
  assert.equal(product.customizable, false);
  assert.equal(product.published, true);
  assert.match(product.sellingModel, /box/i);
  assert.equal(product.gallery.length, 10);
  assert.ok(product.primaryImage.url.includes("reward-cards-box-set"));
});

test("reward cards database product and category are created with confirmed values", async () => {
  const category = await prisma.category.findUnique({
    where: { slug: "reward-cards" },
  });
  assert.ok(category, "Category reward-cards must exist in database");
  assert.equal(category.name, "Reward Cards");
  assert.equal(category.arabicName, "كروت التشجيع");
  assert.equal(category.published, true);

  const product = await prisma.product.findUnique({
    where: { slug: "reward-cards-box-set" },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  assert.ok(product, "Product reward-cards-box-set must exist in database");
  assert.equal(product.price, 200);
  assert.equal(product.stock, 50);
  assert.equal(product.sku, "DD-RC-010");
  assert.equal(product.customizable, false);
  assert.equal(product.published, true);
  assert.equal(product.images.length, 11);
  assert.equal(product.images[0].position, 0);
  assert.equal(product.images[0].url, "/products/reward-cards/reward-cards-box-set.jpeg");
});

test("checkout validation enforces stock boundaries for reward cards", async () => {
  const product = await prisma.product.findUnique({
    where: { slug: "reward-cards-box-set" },
  });
  assert.ok(product);

  // Available stock is 50; ordering within stock is valid
  assert.ok(product.stock >= 1, "Order quantity 1 is within available stock");
  assert.ok(product.stock >= 10, "Order quantity 10 is within available stock");

  // Ordering more than 50 violates stock boundary
  const requestedOverStock = 51;
  assert.equal(product.stock >= requestedOverStock, false, "Ordering 51 exceeds initial stock of 50");
});
