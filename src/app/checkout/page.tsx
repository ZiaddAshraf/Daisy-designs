"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Image from "@/components/site-image";
import { useCart, useLocale, useTranslation } from "@/components/storefront";
import { checkoutLinePayload } from "@/lib/cart-line-state";
import { directionForLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/products";
import { getProductImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { formatCustomizationEntries } from "@/lib/customization-formatter";
import { formatMessage } from "@/lib/i18n/messages";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    ShoppingBag,
    Truck,
} from "lucide-react";

type OrderConfirmation = {
    number: string;
    total: number;
    items: { productName: string; quantity: number; unitPrice: number; customization?: Record<string, string> }[];
};

const FREE_SHIPPING_THRESHOLD = 2500;
const STANDARD_SHIPPING_FEE = 60;

export default function CheckoutPage() {
    const { items, clear, demoMode } = useCart();
    const locale = useLocale();
    const t = useTranslation();
    const direction = directionForLocale(locale);
    const router = useRouter();
    const submitting = useRef(false);
    const requestId = useRef<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showMobileSummary, setShowMobileSummary] = useState(false);

    const defaultPhone = items.find(item => item.customization?.parent_phone)?.customization?.parent_phone ?? "";

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
    const estimatedTotal = subtotal + shipping;
    const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (demoMode) return;
        if (submitting.current || !items.length) return;
        submitting.current = true;
        setLoading(true);
        setMessage("");
        const form = new FormData(event.currentTarget);
        if (!requestId.current) {
            try { requestId.current = sessionStorage.getItem("daisy-checkout-request-id"); } catch { /* keep this request scoped to the open page */ }
            requestId.current ??= crypto.randomUUID();
            try { sessionStorage.setItem("daisy-checkout-request-id", requestId.current); } catch { /* the in-memory key still prevents repeat submissions */ }
        }

        const rawCoupon = (form.get("couponCode") as string | null)?.trim();
        const rawEmail = (form.get("email") as string | null)?.trim();
        const rawNotes = (form.get("notes") as string | null)?.trim();

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: form.get("fullName"),
                    phone: form.get("phone"),
                    email: rawEmail || undefined,
                    governorate: form.get("governorate"),
                    city: form.get("city"),
                    address: form.get("address"),
                    notes: rawNotes || undefined,
                    couponCode: rawCoupon || undefined,
                    paymentMethod: "COD",
                    requestId: requestId.current,
                    items: items.map(checkoutLinePayload),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errors: Record<string, string> = {
                    PRODUCT_NOT_FOUND: t("checkoutErrProductNotFound"),
                    INVALID_VARIANT: t("checkoutErrInvalidVariant"),
                    VARIANT_REQUIRED: t("checkoutErrVariantRequired"),
                    INVALID_CUSTOMIZATION: t("checkoutErrInvalidCustomization"),
                    UNSUPPORTED_CUSTOMIZATION: t("checkoutErrUnsupportedCustomization"),
                    INVALID_COUPON: t("checkoutErrInvalidCoupon"),
                    MISSING_CUSTOMIZATION: locale === "ar" ? "يا ريت تكتبي بيانات التخصيص والاسم المطلوب لإتمام الطلب" : "Customization details are required",
                    INVALID_GARMENT_COLOR: locale === "ar" ? "لون التيشيرت المختار مش متاح حالياً" : "Invalid garment color",
                    INVALID_GARMENT_SIZE: locale === "ar" ? "مقاس التيشيرت المختار مش متاح حالياً" : "Invalid garment size",
                };
                let displayError = errors[data.error];
                if (!displayError && data.issues?.fieldErrors?.phone?.[0]) {
                    displayError = data.issues.fieldErrors.phone[0];
                }
                if (!displayError && typeof data.error === "string" && !data.error.includes("_")) {
                    displayError = data.error;
                }
                setMessage(data.error?.startsWith("OUT_OF_STOCK")
                    ? t("checkoutErrOutOfStock")
                    : displayError ?? t("checkoutErrGeneral"));
                return;
            }
            const confirmation: OrderConfirmation = data;
            try { sessionStorage.setItem("daisy-order-confirmation", JSON.stringify(confirmation)); } catch { /* order was created; continue to the confirmation page */ }
            try { sessionStorage.removeItem("daisy-checkout-request-id"); } catch { /* the next page load will generate a fresh key */ }
            clear();
            router.replace("/checkout/success");
        } catch {
            setMessage(t("checkoutErrConnection"));
        } finally {
            submitting.current = false;
            setLoading(false);
        }
    }

    if (demoMode) {
        return (
            <main dir={direction} className="mx-auto max-w-[900px] px-6 py-16">
                <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t("checkoutUnavailable")}</h1>
                <p className="mt-5 text-[var(--muted-foreground)]">{t("checkoutDemoNotice")}</p>
                <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white dark:bg-neutral-800">
                    {t("checkoutReturnToPreview")}
                </Link>
            </main>
        );
    }

    return (
        <main dir={direction} className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/cart"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                    {direction === "rtl" ? <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /> : <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />}
                    <span>{t("checkoutReturnToCart")}</span>
                </Link>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
                    <span>DAISY DESIGNS</span>
                    <span>/</span>
                    <span className="text-[var(--foreground)]">{t("checkout")}</span>
                </div>
            </div>

            <div className="mt-4">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
                    {t("checkoutPageTitle")}
                </h1>
            </div>

            {!items.length ? (
                <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center shadow-xs">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--muted-foreground)]">
                        <ShoppingBag size={28} />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{t("checkoutEmptyCartTitle")}</h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("emptyCartMessage")}</p>
                    <Link
                        href="/products"
                        className="mt-6 inline-flex items-center justify-center rounded-xl bg-neutral-950 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-neutral-950 shadow-sm transition-all hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer"
                    >
                        {t("checkoutBrowseProducts")}
                    </Link>
                </div>
            ) : (
                <div className="mt-8">
                    {/* Mobile Collapsible Summary Toggle (< lg) */}
                    <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs lg:hidden">
                        <button
                            type="button"
                            onClick={() => setShowMobileSummary(prev => !prev)}
                            className="flex w-full items-center justify-between p-4 text-start font-medium text-[var(--foreground)]"
                            aria-expanded={showMobileSummary}
                        >
                            <span className="flex items-center gap-2.5 text-sm">
                                <ShoppingBag size={18} className="text-amber-500" />
                                <span>{t("orderSummary")}</span>
                                <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                                    {totalItemCount}
                                </span>
                            </span>
                            <span className="flex items-center gap-2">
                                <strong className="text-base font-bold text-[var(--foreground)]">
                                    {formatPrice(estimatedTotal, locale)}
                                </strong>
                                {showMobileSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </span>
                        </button>

                        {showMobileSummary && (
                            <div className="border-t border-[var(--border)] bg-[var(--surface-soft)]/50 p-4">
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.lineId} className="flex items-start gap-3 text-sm">
                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
                                                <Image
                                                    src={getProductImageUrl(item.image) || PRODUCT_IMAGE_PLACEHOLDER}
                                                    alt={item.name}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-[var(--foreground)] truncate">{item.name}</p>
                                                    <span className="shrink-0 font-medium text-[var(--foreground)]">
                                                        {formatPrice(item.price * item.quantity, locale)}
                                                    </span>
                                                </div>
                                                {item.variantName && (
                                                    <p className="text-xs text-[var(--muted-foreground)]">{item.variantName}</p>
                                                )}
                                                {item.customization && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {formatCustomizationEntries(item.customization, locale).map(entry => (
                                                            <span
                                                                key={entry.key}
                                                                className="inline-flex items-center gap-1 rounded bg-[var(--card)] px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)] border border-[var(--border)]/60"
                                                            >
                                                                <span className="font-medium text-[var(--foreground)]">{entry.label}:</span>
                                                                <span className="truncate max-w-[120px]">{entry.displayValue}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                                    {t("quantity")}: {item.quantity} × {formatPrice(item.price, locale)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-3 text-xs">
                                    <div className="flex justify-between text-[var(--muted-foreground)]">
                                        <span>{t("subtotal")}</span>
                                        <span>{formatPrice(subtotal, locale)}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--muted-foreground)]">
                                        <span>{t("shippingFee")}</span>
                                        <span>
                                            {shipping === 0 ? (
                                                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("freeShipping")}</strong>
                                            ) : (
                                                formatPrice(shipping, locale)
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-[var(--border)] pt-2 text-sm font-bold text-[var(--foreground)]">
                                        <span>{t("total")}</span>
                                        <span>{formatPrice(estimatedTotal, locale)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main 2-Column Grid */}
                    <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-start">
                        {/* Left Column: Checkout Form */}
                        <form id="checkout-form" className="space-y-6" onSubmit={submit}>
                            {/* Card 1: Customer Details */}
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-xs">
                                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                                        1
                                    </div>
                                    <h2 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
                                        {t("customerDetails")}
                                    </h2>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
                                        <span>
                                            {t("checkoutFullName")} <strong className="text-red-500">*</strong>
                                        </span>
                                        <input
                                            name="fullName"
                                            required
                                            minLength={2}
                                            maxLength={120}
                                            autoComplete="name"
                                            placeholder={locale === "ar" ? "مثال: مريم أحمد" : "e.g. Maryam Ahmed"}
                                            className="w-full min-w-0 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                        />
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
                                        <span>
                                            {t("checkoutPhone")} <strong className="text-red-500">*</strong>
                                        </span>
                                        <input
                                            name="phone"
                                            defaultValue={defaultPhone}
                                            required
                                            minLength={8}
                                            maxLength={30}
                                            type="tel"
                                            inputMode="tel"
                                            autoComplete="tel"
                                            placeholder="01012345678"
                                            className="w-full min-w-0 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                        />
                                        <span className="text-xs text-[var(--muted-foreground)]">
                                            {t("egyptPhoneHelp")}
                                        </span>
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
                                        <span>{t("checkoutEmailOptional")}</span>
                                        <input
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            className="w-full min-w-0 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Card 2: Delivery Address */}
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-xs">
                                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                                        2
                                    </div>
                                    <h2 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
                                        {t("deliveryAddress")}
                                    </h2>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
                                        <span>
                                            {t("checkoutGovernorate")} <strong className="text-red-500">*</strong>
                                        </span>
                                        <input
                                            name="governorate"
                                            required
                                            minLength={2}
                                            maxLength={80}
                                            autoComplete="address-level1"
                                            placeholder={locale === "ar" ? "مثال: القاهرة / الجيزة / الإسكندرية" : "e.g. Cairo / Giza / Alexandria"}
                                            className="w-full min-w-0 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                        />
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
                                        <span>
                                            {t("checkoutCity")} <strong className="text-red-500">*</strong>
                                        </span>
                                        <input
                                            name="city"
                                            required
                                            minLength={2}
                                            maxLength={80}
                                            autoComplete="address-level2"
                                            placeholder={locale === "ar" ? "مثال: المعادي / الشيخ زايد / سموحة" : "e.g. Maadi / Sheikh Zayed / Smouha"}
                                            className="w-full min-w-0 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                        />
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
                                        <span>
                                            {t("checkoutAddress")} <strong className="text-red-500">*</strong>
                                        </span>
                                        <textarea
                                            name="address"
                                            required
                                            minLength={5}
                                            maxLength={300}
                                            autoComplete="street-address"
                                            rows={3}
                                            placeholder={locale === "ar" ? "اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة" : "Street name, building number, apartment, landmark"}
                                            className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Card 3: Payment Method & Notes */}
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-xs">
                                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                                        3
                                    </div>
                                    <h2 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
                                        {t("paymentAndNotes")}
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {/* COD Highlight Box */}
                                    <div className="flex items-start gap-3.5 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-[var(--foreground)]">
                                                {t("paymentMethodCod")}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
                                                {t("paymentMethodCodDesc")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
                                            <span>{t("checkoutCouponOptional")}</span>
                                            <input
                                                name="couponCode"
                                                maxLength={40}
                                                autoComplete="off"
                                                placeholder={locale === "ar" ? "اكتبي الكود لو معاكي كوبون" : "Enter code if available"}
                                                className="w-full min-w-0 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                            />
                                        </label>

                                        <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
                                            <span>{t("orderNotesOptional")}</span>
                                            <input
                                                name="notes"
                                                maxLength={300}
                                                autoComplete="off"
                                                placeholder={locale === "ar" ? "أي ملاحظة تحبيها لمندوب الشحن" : "Notes for the courier"}
                                                className="w-full min-w-0 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-base sm:text-sm text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {message && (
                                <div
                                    role="alert"
                                    aria-live="polite"
                                    className="rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 p-4 text-sm font-medium text-red-700 dark:text-red-400"
                                >
                                    {message}
                                </div>
                            )}

                            {/* Action Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="min-h-14 w-full rounded-xl bg-neutral-950 dark:bg-white px-6 py-4 text-base font-bold text-white dark:text-neutral-950 shadow-md transition-all hover:opacity-95 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:cursor-wait disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    {loading ? (
                                        <span>{t("checkoutSubmitting")}</span>
                                    ) : (
                                        <>
                                            <span>{t("checkoutConfirmButton")}</span>
                                            {direction === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                                        </>
                                    )}
                                </button>
                                <p className="mt-2.5 text-center text-xs text-[var(--muted-foreground)]">
                                    {t("checkoutPaymentNotice")}
                                </p>
                            </div>
                        </form>

                        {/* Right Column: Sticky Order Summary (Desktop) */}
                        <aside className="hidden lg:block lg:sticky lg:top-24 space-y-6">
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-xs">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={20} className="text-amber-500" />
                                        <h2 className="text-lg font-bold text-[var(--foreground)]">{t("orderSummary")}</h2>
                                    </div>
                                    <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                                        {formatMessage(t("orderItemsCount"), { count: totalItemCount })}
                                    </span>
                                </div>

                                {/* Items list */}
                                <div className="mt-4 max-h-80 overflow-y-auto space-y-4 pr-1">
                                    {items.map(item => (
                                        <div key={item.lineId} className="flex items-start gap-3.5 pb-3 border-b border-[var(--border)]/60 last:border-b-0 last:pb-0">
                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
                                                <Image
                                                    src={getProductImageUrl(item.image) || PRODUCT_IMAGE_PLACEHOLDER}
                                                    alt={item.name}
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                                                        {item.name}
                                                    </p>
                                                    <span className="shrink-0 font-bold text-sm text-[var(--foreground)]">
                                                        {formatPrice(item.price * item.quantity, locale)}
                                                    </span>
                                                </div>
                                                {item.variantName && (
                                                    <p className="text-xs text-[var(--muted-foreground)]">{item.variantName}</p>
                                                )}
                                                {item.customization && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        {formatCustomizationEntries(item.customization, locale).map(entry => (
                                                            <span
                                                                key={entry.key}
                                                                className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)] border border-[var(--border)]/70"
                                                            >
                                                                <span className="font-medium text-[var(--foreground)]">{entry.label}:</span>
                                                                <span className="truncate max-w-[130px]">{entry.displayValue}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                                                    {t("quantity")}: {item.quantity} × {formatPrice(item.price, locale)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Free Shipping Progress Bar */}
                                <div className="mt-5 rounded-xl bg-[var(--surface-soft)] p-3.5 border border-[var(--border)]">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                                            <Truck size={14} className="text-teal-600 dark:text-teal-400" />
                                            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                    {t("freeShippingUnlocked")}
                                                </span>
                                            ) : (
                                                <span>
                                                    {formatMessage(t("freeShippingProgress"), {
                                                        amount: amountToFreeShipping.toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
                                                    })}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                                            style={{ width: `${freeShippingProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Totals Breakdown */}
                                <div className="mt-5 space-y-2.5 border-t border-[var(--border)] pt-4 text-sm">
                                    <div className="flex justify-between text-[var(--muted-foreground)]">
                                        <span>{t("subtotal")}</span>
                                        <span className="font-medium text-[var(--foreground)]">{formatPrice(subtotal, locale)}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--muted-foreground)]">
                                        <span>{t("shippingFee")}</span>
                                        <span>
                                            {shipping === 0 ? (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                    <CheckCircle2 size={12} />
                                                    {t("freeShipping")}
                                                </span>
                                            ) : (
                                                <span className="font-medium text-[var(--foreground)]">{formatPrice(shipping, locale)}</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--foreground)]">
                                        <span>{t("total")}</span>
                                        <span className="text-lg text-[var(--foreground)]">{formatPrice(estimatedTotal, locale)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Points */}
                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-3">
                                <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
                                    <ShieldCheck size={18} className="text-amber-500 shrink-0" />
                                    <span>{t("trustCashOnDelivery")}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
                                    <Truck size={18} className="text-amber-500 shrink-0" />
                                    <span>{t("trustNationwideDelivery")}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
                                    <ShieldCheck size={18} className="text-teal-600 dark:text-teal-400 shrink-0" />
                                    <span>{t("trustKidSafe")}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            )}
        </main>
    );
}
