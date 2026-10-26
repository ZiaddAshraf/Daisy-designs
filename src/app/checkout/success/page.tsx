"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslation } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/products";
import { formatCustomizationEntries } from "@/lib/customization-formatter";
import { CheckCircle2, ShoppingBag, MessageCircle, ShieldCheck } from "lucide-react";

type Confirmation = {
  number: string;
  total: number;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    customization?: Record<string, string>;
  }[];
};

export default function CheckoutSuccessPage() {
  const locale = useLocale();
  const t = useTranslation();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("daisy-order-confirmation");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Confirmation;
      queueMicrotask(() => setConfirmation(parsed));
    } catch {
      sessionStorage.removeItem("daisy-order-confirmation");
    }
  }, []);

  return (
    <main
      dir={directionForLocale(locale)}
      className="mx-auto max-w-[760px] px-6 py-16 sm:py-24"
    >
      <p className="text-xs tracking-[.2em] text-[var(--muted-foreground)]">
        DAISY DESIGNS / {t("checkoutSuccessEyebrow").toUpperCase()}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl text-[var(--foreground)]">
          {confirmation
            ? t("checkoutSuccessTitle")
            : t("checkoutSuccessPending")}
        </h1>
      </div>

      {confirmation ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div>
              <span className="text-xs text-[var(--muted-foreground)] block">
                {t("checkoutSuccessOrderNumber")}
              </span>
              <strong dir="ltr" className="text-xl font-bold text-[var(--foreground)] tracking-wide">
                {confirmation.number}
              </strong>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {t("checkoutSuccessPaymentMethod")}
            </span>
          </div>

          <section aria-label={t("checkoutSuccessOrderDetails")} className="divide-y divide-[var(--border)]">
            {confirmation.items.map((item, index) => (
              <div
                key={`${item.productName}-${index}`}
                className="flex flex-wrap items-start justify-between gap-4 py-5"
              >
                <div className="space-y-1.5 max-w-[460px]">
                  <p className="font-semibold text-[var(--foreground)]">
                    {item.productName}{" "}
                    <span className="text-sm font-normal text-[var(--muted-foreground)]">
                      × {item.quantity}
                    </span>
                  </p>

                  {item.customization && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formatCustomizationEntries(item.customization, locale).map((entry) => (
                        <span
                          key={entry.key}
                          className="inline-flex items-center gap-1 rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
                        >
                          <strong className="font-semibold text-[var(--foreground)]">
                            {entry.label}:
                          </strong>
                          <span>{entry.displayValue}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-[var(--foreground)] whitespace-nowrap">
                  {formatPrice(item.unitPrice * item.quantity, locale)}
                </span>
              </div>
            ))}
          </section>

          <div className="border-t border-[var(--border)] pt-6 mt-2 space-y-2">
            <div className="flex items-center justify-between text-base font-semibold text-[var(--foreground)]">
              <span>{t("checkoutSuccessTotal")}</span>
              <strong className="text-xl font-bold">
                {formatPrice(confirmation.total, locale)}
              </strong>
            </div>
          </div>

          {/* Instant WhatsApp Confirmation */}
          <div className="mt-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {locale === "ar" ? "تأكيد الطلب السريع والمتابعة على الواتساب" : "Instant WhatsApp Confirmation"}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {locale === "ar" ? "تواصلي مباشرة مع فريق Daisy Designs لمتابعة تجهيز وشحن طلبك أولاً بأول" : "Chat directly with our team to track order preparation and shipping"}
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/201012345678?text=${encodeURIComponent(
                locale === "ar"
                  ? `أهلاً دايزي ديزاينز! أنا عملت أوردر برقم (${confirmation.number}) بإجمالي ${formatPrice(confirmation.total, locale)}. حابة أتابع معاكم التجهيز والشحن!`
                  : `Hello Daisy Designs! I placed order (${confirmation.number}) with total ${formatPrice(confirmation.total, locale)}. Looking forward to delivery updates!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all"
            >
              <MessageCircle size={16} />
              <span>{locale === "ar" ? "تأكيد فوري على واتساب" : "Confirm via WhatsApp"}</span>
            </a>
          </div>

          {/* Delivery & Inspection Reassurance Notice */}
          <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] flex items-start gap-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
            <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--foreground)] font-semibold block mb-0.5">
                {locale === "ar" ? "الدفع عند الاستلام بعد المعاينة التامة" : "Cash on Delivery After Full Inspection"}
              </strong>
              <span>
                {locale === "ar"
                  ? "طلبك قيد التجهيز الآن بعناية. مندوب شركة الشحن هيتصل بيكي هاتفياً قبل موعد التسليم لتأكيد العنوان والمعاد المناسب، وهتعايني المنتج بالكامل قبل الدفع."
                  : "Your order is being carefully prepared. The courier will call you before delivery to coordinate timing, and you can inspect items before paying."}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" />
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {t("checkoutSuccessNoSession")}
          </p>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/products"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 dark:bg-neutral-800 px-8 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          {t("checkoutSuccessContinue")}
        </Link>
      </div>
    </main>
  );
}
