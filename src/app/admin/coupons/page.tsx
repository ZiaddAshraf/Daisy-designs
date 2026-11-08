import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function AdminCouponsPage() { if (!(await isAdmin())) redirect("/login"); const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }); return <main className="mx-auto max-w-[1100px] px-6 py-12"><p className="text-xs text-neutral-400">DAISY DESIGNS / الإدارة / الكوبونات</p><h1 className="mt-4 text-4xl font-semibold">الكوبونات</h1><div className="mt-10 space-y-3">{coupons.map(coupon => <div key={coupon.id} className="flex justify-between border-b border-neutral-200 py-4"><span>{coupon.code}</span><span>{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `${coupon.value} ج.م`}</span></div>)}</div></main>; }
