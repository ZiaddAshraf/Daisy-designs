/* eslint-disable react/no-unescaped-entities */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSettingsForm } from "@/components/admin-settings-form";
export const dynamic = "force-dynamic";
export default async function AdminSettingsPage() { const session = await getServerSession(authOptions); if (session?.user?.role !== "ADMIN") redirect("/login"); const rows = await prisma.siteSetting.findMany(); const initial = { ...Object.fromEntries(rows.map(row => [row.key, row.value])), brandName: "Daisy Designs" }; return <main className="mx-auto max-w-[1000px] px-6 py-12 lg:px-0"><p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / SETTINGS</p><h1 className="mt-3 mb-12 text-4xl font-semibold">إعدادات ا�"�.تجر</h1><AdminSettingsForm initial={initial} /></main>; }
