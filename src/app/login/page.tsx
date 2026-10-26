"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLocale } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  return (
    <main dir={dir} className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 sm:p-12 shadow-sm">
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {isAr ? "الحساب" : "ACCOUNT"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {isAr ? "تسجيل الدخول" : "Sign In"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {isAr
            ? "مرحباً بك مجدداً! أدخل بيانات حسابك للمتابعة"
            : "Welcome back! Enter your details to access your account"}
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            const form = new FormData(event.currentTarget);
            const result = await signIn("credentials", {
              email: form.get("email"),
              password: form.get("password"),
              redirect: false,
              callbackUrl: "/account",
            });
            if (result?.error) {
              setError(
                isAr
                  ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                  : "Invalid email or password."
              );
            } else {
              window.location.href = result?.url ?? "/account";
            }
            setLoading(false);
          }}
        >
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-[var(--foreground)] mb-1.5"
            >
              {isAr ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              id="login-email"
              name="email"
              required
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[var(--foreground)]"
              >
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors underline"
              >
                {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </Link>
            </div>
            <input
              id="login-password"
              name="password"
              required
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 transition-all"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-6 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span>{loading ? (isAr ? "جارٍ الدخول..." : "Signing In...") : (isAr ? "دخول" : "Sign In")}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            {isAr ? "ليس لديك حساب بعد؟" : "Don't have an account yet?"}{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--foreground)] underline hover:opacity-80 transition-opacity"
            >
              {isAr ? "إنشاء حساب جديد" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
