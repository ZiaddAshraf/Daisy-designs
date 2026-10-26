import { prisma } from "../src/lib/prisma";

// Targeted, repeatable catalog change. No deletes, stock resets, or order rewrites.
const packages = [
  { code: "combined", price: 300, arabicName: "٢٥ تيكت + ٣٠ ليبل", englishName: "25 tickets + 30 labels", tickets: 25, labels: 30 },
  { code: "tickets", price: 150, arabicName: "تيكت فقط — ٢٥ تيكت", englishName: "Tickets only — 25 tickets", tickets: 25, labels: 0 },
  { code: "labels", price: 150, arabicName: "ليبل فقط — ٣٠ ليبل", englishName: "Labels only — 30 labels", tickets: 0, labels: 30 },
];
async function main() {
  const apply = process.argv.includes("--apply");
  await prisma.$transaction(async tx => {
    const products = await tx.product.findMany({ where: { NOT: { slug: { startsWith: "demo-" } } }, include: { variants: true } });
    const find = (slug: string, names: string[]) => {
      const matches = products.filter(p => p.slug === slug || names.includes(p.arabicName) || names.includes(p.name));
      if (matches.length > 1) throw new Error(`Ambiguous product: ${slug}`);
      return matches[0];
    };
    const tickets = find("custom-waterproof-stickers", ["تيكت وليبل", "استيكرات مدرسية مخصصة مقاومة للماء"]);
    const tshirt = find("custom-printed-tshirt", []);
    if (!tickets || !tshirt) throw new Error("Expected existing ticket/label and T-shirt products");
    if (tickets.variants.some(v => !packages.some(pack => v.sku === `${tickets.sku}-${pack.code.toUpperCase()}`))) throw new Error("Unrecognized existing ticket variant; review before updating");
    const additions = [
      { slug: "heat-transfer-clothing-labels", sku: "DD-HT-005", name: "Heat-transfer clothing labels — 5 pieces", arabicName: "ليبل حراري للملابس — ٥ قطع", price: 100, aliases: ["ليبل حراري للملابس", "Heat-transfer clothing labels"] },
      { slug: "keychain", sku: "DD-KC-001", name: "Keychain", arabicName: "ميدالية", price: 70, aliases: ["ميدالية", "ميدالية الاسم", "Keychain"] },
      { slug: "id-card", sku: "DD-ID-001", name: "ID", arabicName: "آي دي", price: 150, aliases: ["آي دي", "اي دي", "ID", "ID card"] },
    ];
    const matches = additions.map(p => ({ spec: p, existing: find(p.slug, [p.arabicName, p.name, ...p.aliases]) }));
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", tickets: { id: tickets.id, slug: tickets.slug, price: 300, stockUnchanged: tickets.stock, packages }, tshirt: { id: tshirt.id, price: 450, stockUnchanged: tshirt.stock }, products: matches.map(({ spec, existing }) => ({ slug: existing?.slug ?? spec.slug, price: spec.price, action: existing ? "update" : "create with zero stock", stock: existing?.stock ?? 0 })) }, null, 2));
    if (!apply) return;
    await tx.category.updateMany({ where: { OR: [{ id: tickets.categoryId }, { arabicName: { in: ["ستيكرات وملصقات", "استيكرات وملصقات"] } }] }, data: { arabicName: "تيكت وليبل", name: "Tickets & Labels" } });
    await tx.product.update({ where: { id: tickets.id }, data: { price: 300, compareAtPrice: null, name: "Tickets & Labels", arabicName: "تيكت وليبل", description: "Choose 25 tickets + 30 labels, 25 tickets only, or 30 labels only.", arabicDescription: "اختاري ٢٥ تيكت + ٣٠ ليبل، أو ٢٥ تيكت فقط، أو ٣٠ ليبل فقط." } });
    for (const pack of packages) {
      const sku = `${tickets.sku}-${pack.code.toUpperCase()}`;
      const existing = tickets.variants.find(v => v.sku === sku);
      const data = { name: pack.arabicName, price: pack.price, options: { ...pack, inventory: "product" } };
      if (existing) await tx.productVariant.update({ where: { id: existing.id }, data });
      else await tx.productVariant.create({ data: { ...data, sku, productId: tickets.id } });
    }
    await tx.product.update({ where: { id: tshirt.id }, data: { price: 450, compareAtPrice: null } });
    await tx.productVariant.updateMany({ where: { productId: tshirt.id, price: { not: null } }, data: { price: 450 } });
    for (const { spec, existing } of matches) {
      if (existing) {
        await tx.product.update({ where: { id: existing.id }, data: { price: spec.price, compareAtPrice: null, published: true, name: spec.name, arabicName: spec.arabicName } });
        await tx.productVariant.updateMany({ where: { productId: existing.id, price: { not: null } }, data: { price: spec.price } });
      } else {
        await tx.product.create({ data: { slug: spec.slug, sku: spec.sku, name: spec.name, arabicName: spec.arabicName, price: spec.price, description: spec.name, arabicDescription: spec.arabicName, categoryId: tickets.categoryId, tags: [], published: true } });
      }
    }
  }, { timeout: 30000 });
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Catalog update failed"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
