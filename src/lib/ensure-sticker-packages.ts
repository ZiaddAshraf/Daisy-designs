import { prisma } from "@/lib/prisma";

const packages = [
  { code: "combined", price: 300, arabicName: "٢٠ تيكت + ٢٥ ليبل — صورة حقيقية", englishName: "20 tickets + 25 labels — real photo", tickets: 20, labels: 25 },
  { code: "combined-ai", price: 400, arabicName: "٢٠ تيكت + ٢٥ ليبل — صورة AI", englishName: "20 tickets + 25 labels — AI image", tickets: 20, labels: 25 },
  { code: "tickets", price: 150, arabicName: "٢٠ تيكت", englishName: "20 tickets", tickets: 20, labels: 0 },
  { code: "labels", price: 150, arabicName: "٢٥ ليبل", englishName: "25 labels", tickets: 0, labels: 25 },
] as const;

export async function ensureStickerPackages(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { slug: "custom-waterproof-stickers" },
      include: { variants: true },
    });
    if (!product) return;
    await tx.product.update({
      where: { id: product.id },
      data: {
        price: 300,
        description: "Choose 20 tickets and 25 labels with a real photo for EGP 300 or an AI image for EGP 400, or choose 20 tickets or 25 labels.",
        arabicDescription: "اختاري ٢٠ تيكت و٢٥ ليبل بصورة حقيقية بـ٣٠٠ ج.م أو بصورة AI بـ٤٠٠ ج.م، أو باقة التيكت أو الليبل منفردة.",
      },
    });
    for (const pack of packages) {
      const sku = `${product.sku}-${pack.code.toUpperCase()}`;
      const existing = product.variants.find((variant) => variant.sku === sku);
      const data = {
        name: pack.arabicName,
        price: pack.price,
        options: { ...pack, inventory: "product" },
      };
      if (existing) await tx.productVariant.update({ where: { id: existing.id }, data });
      else await tx.productVariant.create({ data: { ...data, sku, productId: product.id } });
    }
  });
}
