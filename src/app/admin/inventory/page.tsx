/* eslint-disable react/no-unescaped-entities */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function InventoryPage() { const session = await getServerSession(authOptions); if (session?.user?.role !== "ADMIN") redirect("/login"); const products = await prisma.product.findMany({ select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true }, orderBy: { stock: "asc" } }); return <main className="mx-auto max-w-[1200px] px-6 py-12 lg:px-0"><p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / INVENTORY</p><h1 className="mt-3 text-4xl font-semibold">ا�"�.خز�^�?</h1><div className="mt-12 overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b border-neutral-950"><th className="py-4">ا�"�.�?تج</th><th>SKU</th><th>ا�"�.تاح</th><th>ا�"حا�"ة</th></tr></thead><tbody>{products.map(product => <tr key={product.id} className="border-b border-neutral-200"><td className="py-5">{product.name}</td><td className="text-neutral-500">{product.sku}</td><td>{product.stock}</td><td className={product.stock === 0 ? "text-red-600" : product.stock <= product.lowStockThreshold ? "text-amber-600" : "text-green-700"}>{product.stock === 0 ? "غ�Sر �.ت�^فر" : product.stock <= product.lowStockThreshold ? "�.خز�^�? �.�?خفض" : "�.ت�^فر"}</td></tr>)}</tbody></table></div></main>; }
