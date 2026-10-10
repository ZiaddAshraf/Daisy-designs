"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    return <main className="mx-auto max-w-md px-6 py-24"><h1 className="text-4xl font-semibold">نسيت كلمة المرور؟</h1><form className="mt-10 space-y-5" onSubmit={async event => { event.preventDefault(); setLoading(true); setMessage(""); const email = new FormData(event.currentTarget).get("email"); const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json(); setMessage(data.message ?? data.error ?? "تعذر إرسال الرابط."); setLoading(false); }}><input name="email" required type="email" autoComplete="email" placeholder="البريد الإلكتروني" className="w-full border-b border-neutral-300 py-3" /><button disabled={loading} className="w-full bg-neutral-950 py-4 text-white disabled:opacity-50">{loading ? "جارٍ الإرسال..." : "إرسال الرابط"}</button></form>{message && <p className="mt-6 text-sm text-neutral-600">{message}</p>}</main>;
}
