BEGIN;

WITH quantities AS (
  SELECT item."productId", SUM(item."quantity") AS quantity
  FROM "OrderItem" item
  JOIN "Order" orders ON orders."id" = item."orderId"
  WHERE orders."number" IN ('ST-B41AE7613366B289', 'ST-3276096BD7867D4E', 'ST-09D996333B71EBC6')
    AND orders."status" = 'PENDING'
    AND orders."shippingAddress"->>'fullName' = 'اختبار تقني - يرجى إلغاء الطلب'
    AND item."variantId" IS NULL
    AND item."productId" IS NOT NULL
  GROUP BY item."productId"
)
UPDATE "Product" product
SET "stock" = product."stock" + quantities.quantity
FROM quantities
WHERE product."id" = quantities."productId";

WITH quantities AS (
  SELECT item."variantId", SUM(item."quantity") AS quantity
  FROM "OrderItem" item
  JOIN "Order" orders ON orders."id" = item."orderId"
  WHERE orders."number" IN ('ST-B41AE7613366B289', 'ST-3276096BD7867D4E', 'ST-09D996333B71EBC6')
    AND orders."status" = 'PENDING'
    AND orders."shippingAddress"->>'fullName' = 'اختبار تقني - يرجى إلغاء الطلب'
    AND item."variantId" IS NOT NULL
  GROUP BY item."variantId"
)
UPDATE "ProductVariant" variant
SET "stock" = variant."stock" + quantities.quantity
FROM quantities
WHERE variant."id" = quantities."variantId";

UPDATE "Order"
SET "status" = 'CANCELLED'
WHERE "number" IN ('ST-B41AE7613366B289', 'ST-3276096BD7867D4E', 'ST-09D996333B71EBC6')
  AND "status" = 'PENDING'
  AND "shippingAddress"->>'fullName' = 'اختبار تقني - يرجى إلغاء الطلب';

COMMIT;
