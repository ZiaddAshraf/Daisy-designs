import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminProductForm } from "@/components/admin-product-form";

export const dynamic = "force-dynamic";
export default async function NewProductPage() { if (!(await isAdmin())) redirect("/login"); const categories = await prisma.category.findMany({ select: { id: true, arabicName: true }, orderBy: { arabicName: "asc" } }); return <main className="px-6 py-12 lg:px-16"><p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / NEW PRODUCT</p><h1 className="mx-auto mt-3 mb-12 max-w-3xl text-4xl font-semibold">إضافة منتج</h1><AdminProductForm categories={categories} /></main>; }
