import { prisma } from "@/lib/prisma";
import { ensureKeychainCatalogProducts } from "@/lib/ensure-catalog-product";

const KEYCHAIN_SLUGS = [
  "custom-acrylic-name-keychain",
  "keychain-lamine-yamal",
  "keychain-cristiano-ronaldo",
];

export async function ensureKeychainCategory(): Promise<void> {
  await ensureKeychainCatalogProducts();

  await prisma.$transaction(async (tx) => {
    const category = await tx.category.upsert({
      where: { slug: "keychains" },
      update: {
        name: "Personalized Keychains",
        arabicName: "ميداليات مخصصة",
        image: "/products/keychains/keychains-collection.jpeg",
        published: true,
      },
      create: {
        slug: "keychains",
        name: "Personalized Keychains",
        arabicName: "ميداليات مخصصة",
        description: "Personalized acrylic name keychains for bags and keys.",
        image: "/products/keychains/keychains-collection.jpeg",
        published: true,
      },
    });
    await tx.product.updateMany({
      where: { slug: { in: KEYCHAIN_SLUGS }, categoryId: { not: category.id } },
      data: { categoryId: category.id },
    });
    await tx.category.updateMany({
      where: { slug: "stickers" },
      data: { name: "Tickets & Labels", arabicName: "تيكت وليبل" },
    });
  });
}
