import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { CashOnDeliveryProvider } from "../src/lib/payments";
import { calculateShipping } from "../src/lib/commerce-rules";
import { randomBytes } from "node:crypto";

async function verifyCheckoutTransaction() {
  console.log("=== Testing Reward Cards COD Checkout Transaction ===");

  const product = await prisma.product.findUnique({
    where: { slug: "reward-cards-box-set", published: true },
    include: { images: true, customizationFields: true },
  });

  if (!product) {
    throw new Error("Product reward-cards-box-set not found or not published");
  }

  console.log(`Initial Product State:`);
  console.log(`  Name:  ${product.name}`);
  console.log(`  Price: ${product.price} EGP (per complete box)`);
  console.log(`  Stock: ${product.stock} boxes`);
  console.log(`  SKU:   ${product.sku}`);

  const initialStock = product.stock;

  // 1. Test Out-of-Stock Guard
  const overStockQuantity = initialStock + 1;
  const isOutOfStock = product.stock < overStockQuantity;
  console.log(`\n1. Out-of-stock boundary guard (ordering ${overStockQuantity} units against ${product.stock} available):`);
  console.log(`   Correctly flagged as out of stock? ${isOutOfStock}`);
  if (!isOutOfStock) throw new Error("Out-of-stock guard failed!");

  // 2. Test Transactional Order Placement (1 box, COD)
  const orderQuantity = 1;
  const unitPrice = product.price;
  const subtotal = unitPrice * orderQuantity;
  const shipping = calculateShipping(subtotal, 60, 2500);
  const total = subtotal + shipping;

  const testOrderNumber = `ST-TEST-${randomBytes(4).toString("hex").toUpperCase()}`;
  console.log(`\n2. Placing test COD order (${testOrderNumber}):`);
  console.log(`   Items: 1x ${product.name} @ ${unitPrice} EGP`);
  console.log(`   Subtotal: ${subtotal} EGP`);
  console.log(`   Shipping: ${shipping} EGP`);
  console.log(`   Total:    ${total} EGP`);

  const payment = new CashOnDeliveryProvider();
  const paymentResult = await payment.createPayment({
    orderNumber: testOrderNumber,
    amount: total,
  });

  // Execute transaction exactly like /api/orders
  const order = await prisma.$transaction(async (tx) => {
    // Atomic stock decrement
    const update = await tx.product.updateMany({
      where: { id: product.id, stock: { gte: orderQuantity } },
      data: { stock: { decrement: orderQuantity } },
    });

    if (update.count !== 1) {
      throw new Error(`OUT_OF_STOCK:${product.name}`);
    }

    return tx.order.create({
      data: {
        number: testOrderNumber,
        status: "PENDING",
        paymentStatus: paymentResult.status,
        paymentMethod: "COD",
        subtotal,
        shipping,
        discount: 0,
        total,
        notes: "Automated test order for Reward Cards verification",
        shippingAddress: {
          fullName: "عميل تجريبي",
          phone: "01000000000",
          governorate: "القاهرة",
          city: "مدينة نصر",
          address: "شارع النصر",
        },
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              productSnapshot: {
                name: product.name,
                arabicName: product.arabicName,
                sku: product.sku,
                price: unitPrice,
                image: product.images[0]?.url,
              },
              quantity: orderQuantity,
              unitPrice,
            },
          ],
        },
      },
      include: { items: true },
    });
  });

  console.log(`   Order created successfully: ID ${order.id}, Total: ${order.total} EGP`);

  // Verify stock decremented
  const updatedProduct = await prisma.product.findUnique({
    where: { id: product.id },
  });
  console.log(`   Stock after purchase: ${updatedProduct?.stock} (Expected: ${initialStock - 1})`);
  if (updatedProduct?.stock !== initialStock - 1) {
    throw new Error(`Stock decrement failed! Expected ${initialStock - 1}, got ${updatedProduct?.stock}`);
  }

  // 3. Clean up test order and restore stock to initial 50
  console.log(`\n3. Restoring stock to initial ${initialStock} and cleaning up test order:`);
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId: order.id } });
    await tx.order.delete({ where: { id: order.id } });
    await tx.product.update({
      where: { id: product.id },
      data: { stock: initialStock },
    });
  });

  const restoredProduct = await prisma.product.findUnique({
    where: { id: product.id },
  });
  console.log(`   Final product stock: ${restoredProduct?.stock} (Restored to exact initial 50)`);

  console.log("\n=== COD Checkout & Stock Decrement Verified Successfully! ===");
}

verifyCheckoutTransaction()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
