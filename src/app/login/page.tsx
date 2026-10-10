"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    return <main className="mx-auto max-w-md px-6 py-24"><p className="text-xs text-neutral-400">DAISY DESIGNS / الحساب</p><h1 className="mt-4 text-4xl font-semibold">تسجيل الدخول</h1><form className="mt-10 space-y-5" onSubmit={async event => { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const result = await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirect: false, callbackUrl: "/account" }); if (result?.error) setError("البريد الإلكتروني أو كلمة المرور غير صحيحة."); else window.location.href = result?.url ?? "/account"; setLoading(false); }}><input name="email" required type="email" autoComplete="email" placeholder="البريد الإلكتروني" className="w-full border-b border-neutral-300 py-3" /><input name="password" required type="password" autoComplete="current-password" placeholder="كلمة المرور" className="w-full border-b border-neutral-300 py-3" /><button disabled={loading} className="w-full bg-neutral-950 py-4 text-white disabled:opacity-50">{loading ? "جارٍ الدخول..." : "دخول"}</button>{error && <p className="text-sm text-red-600">{error}</p>}</form><Link href="/register" className="mt-6 block text-center underline">إنشاء حساب</Link><Link href="/forgot-password" className="mt-3 block text-center text-sm underline">نسيت كلمة المرور؟</Link></main>;
}
