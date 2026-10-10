/* eslint-disable react/no-unescaped-entities */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function AdminReviewsPage() { const session = await getServerSession(authOptions); if (session?.user?.role !== "ADMIN") redirect("/login"); const reviews = await prisma.review.findMany({ include: { user: true, product: true }, orderBy: { createdAt: "desc" } }); return <main className="mx-auto max-w-[1300px] px-6 py-12 lg:px-0"><p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / REVIEWS</p><h1 className="mt-3 text-4xl font-semibold">ا�"�.راجعات</h1><div className="mt-12 space-y-3">{reviews.map(review => <article key={review.id} className="border border-neutral-200 p-6"><div className="flex flex-wrap justify-between gap-3"><strong>{review.product.name}</strong><span>{"�~.".repeat(review.rating)} · {review.status}</span></div><p className="mt-3 font-medium">{review.title}</p><p className="mt-2 text-sm text-neutral-600">{review.comment}</p><p className="mt-3 text-xs text-neutral-400">{review.user.name ?? review.user.email}</p></article>)}</div></main>; }
