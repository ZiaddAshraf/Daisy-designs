/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function AccountOrdersPage() { const session = await getServerSession(authOptions); if (!session?.user?.id) redirect("/login"); const orders = await prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }); return <main className="mx-auto max-w-[1000px] px-6 py-16 lg:px-0"><p className="text-xs tracking-[.2em] text-neutral-400">DAISY DESIGNS / ACCOUNT / ORDERS</p><h1 className="mt-3 text-4xl font-semibold">ط�"بات�S</h1><div className="mt-12">{orders.length ? orders.map(order => <Link href={`/account/orders/${order.id}`} key={order.id} className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 py-6 text-sm"><span>{order.number}</span><span>{order.createdAt.toLocaleDateString("ar-EG")}</span><span>{order.status}</span><strong>{order.total.toLocaleString("ar-EG")} ج.�.</strong></Link>) : <p className="border-y border-neutral-200 py-20 text-center text-neutral-500">�"ا ت�^جد ط�"بات.</p>}</div></main>; }
