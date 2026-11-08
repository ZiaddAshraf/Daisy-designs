import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminSettingsForm } from "@/components/admin-settings-form";
export const dynamic = "force-dynamic";
export default async function AdminSettingsPage() { if (!(await isAdmin())) redirect("/login"); const rows = await prisma.siteSetting.findMany(); const initial = { ...Object.fromEntries(rows.map(row => [row.key, row.value])), brandName: "Daisy Designs" }; return <main className="mx-auto max-w-[1000px] px-6 py-12 lg:px-0"><p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / SETTINGS</p><h1 className="mt-3 mb-12 text-4xl font-semibold">إعدادات المتجر</h1><AdminSettingsForm initial={initial} /></main>; }
