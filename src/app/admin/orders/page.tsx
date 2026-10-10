import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminOrderStatus } from "@/components/admin-order-status";

export const dynamic = "force-dynamic";
export default async function AdminOrdersPage() { const session = await getServerSession(authOptions); if (session?.user?.role !== "ADMIN") redirect("/login"); const orders = await prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } }); return <main className="mx-auto max-w-[1400px] px-6 py-12 lg:px-16"><p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / ORDERS</p><h1 className="mt-3 text-4xl font-semibold">الطلبات</h1><div className="mt-12 overflow-x-auto"><table className="w-full min-w-[800px] text-right text-sm"><thead><tr className="border-b border-neutral-950"><th className="py-4">الطلب</th><th>العميل</th><th>التاريخ</th><th>الدفع</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>{orders.map(order => <tr key={order.id} className="border-b border-neutral-200"><td className="py-5">{order.number}</td><td>{order.user?.name ?? "زائر"}</td><td>{order.createdAt.toLocaleDateString("ar-EG")}</td><td>{order.paymentMethod}</td><td>{order.total.toLocaleString("ar-EG")} ج.م</td><td><AdminOrderStatus id={order.id} value={order.status} /></td></tr>)}</tbody></table></div></main>; }
