import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminPriceForm } from "@/components/admin-price-form";

export const dynamic = "force-dynamic";
export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/login");
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true, category: true } });
  if (!product) notFound();
  return <main className="mx-auto max-w-3xl p-6 space-y-6" dir="rtl"><h1 className="text-3xl">{product.arabicName}</h1><p>{product.category.arabicName} · SKU: {product.sku} · المخزون: {product.stock}</p><AdminPriceForm product={product} /></main>;
}
