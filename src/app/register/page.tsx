"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function RegisterPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    return <main className="mx-auto max-w-md px-6 py-24"><p className="text-xs text-neutral-400">DAISY DESIGNS / الحساب</p><h1 className="mt-4 text-4xl font-semibold">إنشاء حساب</h1><form className="mt-10 space-y-5" onSubmit={async event => { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json(); if (!response.ok) { setError(data.error ?? "تعذر إنشاء الحساب."); setLoading(false); return; } await signIn("credentials", { email: form.get("email"), password: form.get("password"), callbackUrl: "/account" }); }}><input name="name" required autoComplete="name" placeholder="الاسم الكامل" className="w-full border-b border-neutral-300 py-3" /><input name="email" required type="email" autoComplete="email" placeholder="البريد الإلكتروني" className="w-full border-b border-neutral-300 py-3" /><input name="password" required minLength={8} type="password" autoComplete="new-password" placeholder="كلمة المرور" className="w-full border-b border-neutral-300 py-3" /><button disabled={loading} className="w-full bg-neutral-950 py-4 text-white disabled:opacity-50">{loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}</button>{error && <p className="text-sm text-red-600">{error}</p>}</form><Link href="/login" className="mt-6 block text-center underline">لديك حساب؟ دخول</Link></main>;
}
