"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token") ?? "";
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  return (
    <main dir={dir} className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 sm:p-12 shadow-sm">
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {isAr ? "كلمة مرور جديدة" : "NEW PASSWORD"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {isAr ? "تعيين كلمة المرور" : "Set New Password"}
        </h1>

        <form
          className="mt-8 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setMessage("");
            const password = new FormData(event.currentTarget).get("password");
            const response = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            setMessage(
              data.message ?? data.error ?? (isAr ? "تعذر تحديث كلمة المرور." : "Failed to reset password.")
            );
            setLoading(false);
          }}
        >
          <div>
            <label
              htmlFor="reset-password"
              className="block text-xs font-semibold text-[var(--foreground)] mb-1.5"
            >
              {isAr ? "كلمة المرور الجديدة (٨ خانات على الأقل)" : "New Password (min 8 characters)"}
            </label>
            <input
              id="reset-password"
              name="password"
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 transition-all"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-6 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span>{loading ? (isAr ? "جارٍ التحديث..." : "Updating...") : (isAr ? "تحديث كلمة المرور" : "Update Password")}</span>
          </button>
        </form>

        {message && (
          <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs font-medium text-[var(--foreground)]">
            {message}
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-[var(--foreground)] underline hover:opacity-80 transition-opacity"
          >
            {isAr ? "الذهاب لتسجيل الدخول" : "Proceed to Sign In"}
          </Link>
        </div>
      </div>
    </main>
  );
}
