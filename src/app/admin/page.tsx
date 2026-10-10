import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export default async function AdminPage() { const session = await getServerSession(authOptions); if (session?.user?.role !== "ADMIN") redirect("/login"); return <main className="mx-auto max-w-[1200px] px-6 py-12"><p className="text-xs text-neutral-400">DAISY DESIGNS / الإدارة</p><h1 className="mt-4 text-4xl font-semibold">لوحة التحكم</h1><nav className="mt-12 flex flex-wrap gap-6"><Link href="/admin/products" className="underline">المنتجات</Link><Link href="/admin/orders" className="underline">الطلبات</Link><Link href="/admin/inventory" className="underline">المخزون</Link><Link href="/admin/coupons" className="underline">الكوبونات</Link><Link href="/admin/settings" className="underline">الإعدادات</Link></nav></main>; }
