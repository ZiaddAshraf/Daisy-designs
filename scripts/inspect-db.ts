import { prisma } from "../src/lib/prisma";

async function main() {
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true, arabicName: true }
  });
  console.log("Current Categories in DB:", JSON.stringify(categories, null, 2));

  const rewardCardsCategory = await prisma.category.findUnique({
    where: { slug: "reward-cards" }
  });
  console.log("Reward Cards Category exists?", Boolean(rewardCardsCategory));

  const rewardCardsProduct = await prisma.product.findUnique({
    where: { slug: "reward-cards-box-set" },
    include: { images: true, category: true }
  });
  console.log("Reward Cards Product exists?", Boolean(rewardCardsProduct));

  const productCount = await prisma.product.count();
  console.log("Total products in DB:", productCount);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
