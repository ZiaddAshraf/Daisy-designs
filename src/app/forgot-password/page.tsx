"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  return (
    <main dir={dir} className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 sm:p-12 shadow-sm">
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {isAr ? "استعادة الحساب" : "PASSWORD RECOVERY"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {isAr ? "نسيت كلمة المرور؟" : "Forgot Password?"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {isAr
            ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لتعيين كلمة مرور جديدة."
            : "Enter your registered email and we'll send you a secure link to reset your password."}
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setMessage("");
            const email = new FormData(event.currentTarget).get("email");
            const response = await fetch("/api/auth/forgot-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            const data = await response.json();
            setMessage(
              data.message ?? data.error ?? (isAr ? "تعذر إرسال الرابط." : "Unable to send link.")
            );
            setLoading(false);
          }}
        >
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-xs font-semibold text-[var(--foreground)] mb-1.5"
            >
              {isAr ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              id="forgot-email"
              name="email"
              required
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 transition-all"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-6 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span>{loading ? (isAr ? "جارٍ الإرسال..." : "Sending...") : (isAr ? "إرسال الرابط" : "Send Reset Link")}</span>
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
            {isAr ? "العودة لتسجيل الدخول" : "Back to Sign In"}
          </Link>
        </div>
      </div>
    </main>
  );
}
