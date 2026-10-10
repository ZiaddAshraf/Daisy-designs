"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
    const token = useSearchParams().get("token") ?? "";
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    return <main className="mx-auto max-w-md px-6 py-24"><h1 className="text-4xl font-semibold">كلمة مرور جديدة</h1><form className="mt-10 space-y-5" onSubmit={async event => { event.preventDefault(); setLoading(true); setMessage(""); const password = new FormData(event.currentTarget).get("password"); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json(); setMessage(data.message ?? data.error ?? "تعذر تحديث كلمة المرور."); setLoading(false); }}><input name="password" required minLength={8} type="password" autoComplete="new-password" placeholder="كلمة المرور الجديدة" className="w-full border-b border-neutral-300 py-3" /><button disabled={loading} className="w-full bg-neutral-950 py-4 text-white disabled:opacity-50">{loading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}</button></form>{message && <p className="mt-6 text-sm text-neutral-600">{message}</p>}</main>;
}
