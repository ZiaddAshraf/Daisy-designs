/* eslint-disable react/no-unescaped-entities */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function AdminCategoriesPage() { const session = await getServerSession(authOptions); if (session?.user?.role !== "ADMIN") redirect("/login"); const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { arabicName: "asc" } }); return <main className="mx-auto max-w-[1100px] px-6 py-12 lg:px-0"><p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / CATEGORIES</p><h1 className="mt-3 text-4xl font-semibold">ا�"أ�,سا�.</h1><div className="mt-12 overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b border-neutral-950"><th className="py-4">ا�"عرب�S</th><th>English</th><th>Slug</th><th>ا�"�.�?تجات</th><th>ا�"�?شر</th></tr></thead><tbody>{categories.map(category => <tr key={category.id} className="border-b border-neutral-200"><td className="py-5">{category.arabicName}</td><td>{category.name}</td><td>{category.slug}</td><td>{category._count.products}</td><td>{category.published ? "�.�?ش�^ر" : "�.س�^دة"}</td></tr>)}</tbody></table></div></main>; }
