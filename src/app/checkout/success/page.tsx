"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslation } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/products";
import { formatCustomizationEntries } from "@/lib/customization-formatter";
import {
  type OrderConfirmationData,
  getWhatsAppOrderUrl,
} from "@/lib/whatsapp-order-message";
import {
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Send,
} from "lucide-react";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const reference = params.get("ref") ?? params.get("orderNumber") ?? "";
  return <OrderConfirmation key={reference} reference={reference} />;
}

function OrderConfirmation({ reference }: { reference: string }) {
  const locale = useLocale();
  const t = useTranslation();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  const [confirmation, setConfirmation] = useState<OrderConfirmationData | null>(null);
  const [receiptState, setReceiptState] = useState<"loading" | "missing" | "error">("loading");
  const [attempt, setAttempt] = useState(0);


  const statusLabels: Record<string, [string, string]> = {
    PENDING: ["قيد الانتظار", "Pending"],
    CONFIRMED: ["مؤكد", "Confirmed"],
    PROCESSING: ["قيد التجهيز", "Processing"],
    SHIPPED: ["تم الشحن", "Shipped"],
    DELIVERED: ["تم التسليم", "Delivered"],
    CANCELLED: ["ملغي", "Cancelled"],
    PAID: ["مدفوع", "Paid"],
    FAILED: ["فشل الدفع", "Failed"],
  };
  const statusLabel = (status: string) =>
    statusLabels[status]?.[isAr ? 0 : 1] ?? status;

  useEffect(() => {
    const controller = new AbortController();
    const query = reference ? `?ref=${encodeURIComponent(reference)}` : "";
    fetch(`/api/orders/confirmation${query}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (controller.signal.aborted) return;
        if (response.status === 401 || response.status === 404) {
          setReceiptState("missing");
          return;
        }
        if (!response.ok) throw new Error("Receipt unavailable");
        const order: OrderConfirmationData = await response.json();
        if (!controller.signal.aborted) setConfirmation(order);
      })
      .catch(() => {
        if (!controller.signal.aborted) setReceiptState("error");
      });
    return () => controller.abort();
  }, [reference, attempt]);

  const whatsappUrl = confirmation ? getWhatsAppOrderUrl(confirmation, locale) : null;

  return (
    <main
      dir={dir}
      className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-20"
    >
      {/* Main Success Heading */}
      <div className="mt-4 flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          {confirmation ? <CheckCircle2 size={28} /> : <ShoppingBag size={28} />}
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl text-[var(--foreground)]">
            {confirmation ? t("checkoutSuccessTitle") : t("checkoutSuccessPending")}
          </h1>
        </div>
      </div>

      {confirmation ? (
        <div className="mt-8 space-y-6">
          {/* PRIMARY WHATSAPP ACTION CARD */}
          <section
            aria-label={isAr ? "إرسال تفاصيل الطلب عبر واتساب" : "Send Order Details via WhatsApp"}
            className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-50/80 to-emerald-100/30 p-6 sm:p-8 dark:from-emerald-950/40 dark:to-emerald-900/20 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <MessageCircle size={26} />
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                  {isAr ? "التواصل بخصوص الطلب" : "Contact us about your order"}
                </h2>
                <p className="text-sm text-emerald-900 dark:text-emerald-200">
                  {isAr ? "لو محتاجة تتابعي الطلب، ابعتي تفاصيله على واتساب." : "You can send the order details on WhatsApp to follow up."}
                </p>
                {/* Prominent WhatsApp CTA Button */}
                {whatsappUrl && (
                  <div className="pt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm sm:text-base font-extrabold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <MessageCircle size={20} />
                      <span>{isAr ? "فتح واتساب" : "Open WhatsApp"}</span>
                      <Send size={16} className="rtl:rotate-180" />
                    </a>
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* DETAILED ORDER SUMMARY CARD */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border)] pb-6">
              <div>
                <span className="text-xs text-[var(--muted-foreground)] block">
                  {t("checkoutSuccessOrderNumber")}
                </span>
                <strong dir="ltr" className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-wide">
                  {confirmation.number}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {t("checkoutSuccessPaymentMethod")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                  {statusLabel(confirmation.status || "PENDING")}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            {confirmation.shippingAddress && (
              <div className="py-4 border-b border-[var(--border)] text-xs sm:text-sm text-[var(--muted-foreground)] space-y-1">
                <p>
                  <strong className="text-[var(--foreground)] font-semibold">{isAr ? "الاسم:" : "Name:"}</strong>{" "}
                  {confirmation.shippingAddress.fullName || "-"}
                </p>
                <p>
                  <strong className="text-[var(--foreground)] font-semibold">{isAr ? "الهاتف:" : "Phone:"}</strong>{" "}
                  <span dir="ltr">{confirmation.shippingAddress.phone || "-"}</span>
                </p>
                <p>
                  <strong className="text-[var(--foreground)] font-semibold">{isAr ? "العنوان:" : "Address:"}</strong>{" "}
                  {[
                    confirmation.shippingAddress.governorate,
                    confirmation.shippingAddress.city,
                    confirmation.shippingAddress.address,
                  ]
                    .filter(Boolean)
                    .join(" - ") || "-"}
                </p>
                {confirmation.notes && (
                  <p>
                    <strong className="text-[var(--foreground)] font-semibold">{isAr ? "الملاحظات:" : "Notes:"}</strong>{" "}
                    {confirmation.notes}
                  </p>
                )}
              </div>
            )}

            {/* Items Breakdown */}
            <section aria-label={t("checkoutSuccessOrderDetails")} className="divide-y divide-[var(--border)]">
              {confirmation.items.map((item, index) => (
                <div
                  key={`${item.productName}-${index}`}
                  className="flex flex-wrap items-start justify-between gap-4 py-4"
                >
                  <div className="space-y-1.5 max-w-[460px]">
                    <p className="font-semibold text-sm sm:text-base text-[var(--foreground)]">
                      {item.productName}{" "}
                      <span className="text-xs sm:text-sm font-normal text-[var(--muted-foreground)]">
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
                  <span className="font-semibold text-sm sm:text-base text-[var(--foreground)] whitespace-nowrap">
                    {formatPrice(item.unitPrice * item.quantity, locale)}
                  </span>
                </div>
              ))}
            </section>

            {/* Final Total */}
            <div className="border-t border-[var(--border)] pt-5 mt-2 space-y-2">
              <div className="flex items-center justify-between text-base font-semibold text-[var(--foreground)]">
                <span>{t("checkoutSuccessTotal")}</span>
                <strong className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(confirmation.total, locale)}
                </strong>
              </div>
            </div>

            {/* Delivery & Inspection Reassurance Notice */}
            <div className="mt-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] flex items-start gap-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
              <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--foreground)] font-semibold block mb-0.5">
                  {isAr ? "الدفع عند الاستلام بعد المعاينة التامة" : "Cash on Delivery After Full Inspection"}
                </strong>
                <span>
                  {isAr
                    ? "عند تجهيز وشحن الطلب، سيتواصل معك المندوب لتأكيد موعد التسليم والمعاينة."
                    : "When your order is prepared and dispatched, the courier will contact you to coordinate delivery and inspection."}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div role="status" className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            {receiptState === "loading"
              ? (isAr ? "جارٍ التحقق من الطلب…" : "Checking your order…")
              : receiptState === "missing"
                ? t("checkoutSuccessNoSession")
                : (isAr ? "تعذّر تحميل تفاصيل الطلب." : "We couldn’t load your order details.")}
          </p>
          {receiptState === "error" && (
            <button type="button" className="mt-4 font-semibold underline" onClick={() => {
              setReceiptState("loading");
              setAttempt((value) => value + 1);
            }}>
              {isAr ? "إعادة المحاولة" : "Try again"}
            </button>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/products"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 dark:bg-neutral-100 dark:text-neutral-950 px-8 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          {t("checkoutSuccessContinue")}
        </Link>
      </div>
    </main>
  );
}
