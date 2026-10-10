import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AccountPage() { const session = await getServerSession(authOptions); if (!session?.user?.id) redirect("/login"); return <main className="mx-auto max-w-[1000px] px-6 py-16"><p className="text-xs text-neutral-400">DAISY DESIGNS / الحساب</p><h1 className="mt-4 text-4xl font-semibold">مرحبًا، {session.user.name}</h1><div className="mt-12 flex gap-6"><Link href="/account/orders" className="underline">طلباتي</Link><Link href="/account/addresses" className="underline">عناويني</Link><Link href="/wishlist" className="underline">المفضلة</Link></div></main>; }
