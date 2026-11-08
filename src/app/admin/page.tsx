import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
export default async function AdminPage() { if (!(await isAdmin())) redirect("/login"); return <main className="mx-auto max-w-[1200px] px-6 py-12"><p className="text-xs text-neutral-400">DAISY DESIGNS / الإدارة</p><h1 className="mt-4 text-4xl font-semibold">لوحة التحكم</h1><nav className="mt-12 flex flex-wrap gap-6"><Link href="/admin/products" className="underline">المنتجات</Link><Link href="/admin/orders" className="underline">الطلبات</Link><Link href="/admin/inventory" className="underline">المخزون</Link><Link href="/admin/coupons" className="underline">الكوبونات</Link><Link href="/admin/settings" className="underline">الإعدادات</Link></nav></main>; }
