"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useCart, useLocale } from "@/components/storefront";
import { checkoutLinePayload } from "@/lib/cart-line-state";
import { directionForLocale } from "@/lib/locale";

type OrderConfirmation = {
    number: string;
    total: number;
    items: { productName: string; quantity: number; unitPrice: number; customization?: Record<string, string> }[];
};

export default function CheckoutPage() {
    const { items, clear, demoMode } = useCart();
    const locale = useLocale();
    const direction = directionForLocale(locale);
    const router = useRouter();
    const submitting = useRef(false);
    const requestId = useRef<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: form.get("fullName"), phone: form.get("phone"), email: form.get("email"),
                    governorate: form.get("governorate"), city: form.get("city"), address: form.get("address"),
                    couponCode: form.get("couponCode"), paymentMethod: "COD", requestId: requestId.current, items: items.map(checkoutLinePayload),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errors: Record<string, string> = {
                    PRODUCT_NOT_FOUND: "أحد المنتجات لم يعد متاحًا. راجعي سلتك.",
                    INVALID_VARIANT: "الخيار المحدد لأحد المنتجات لم يعد متاحًا. راجعي سلتك.",
                    VARIANT_REQUIRED: "اختاري تفاصيل المنتج قبل إتمام الطلب.",
                    INVALID_CUSTOMIZATION: "راجعي بيانات تخصيص المنتجات.",
                    UNSUPPORTED_CUSTOMIZATION: "أحد خيارات التخصيص غير متاح حاليًا.",
                    INVALID_COUPON: "تعذر تطبيق رمز الخصم. راجعي الرمز أو قيمة الطلب.",
                };
                setMessage(data.error?.startsWith("OUT_OF_STOCK")
                    ? "الكمية المطلوبة غير متاحة حاليًا. راجعي سلتك."
                    : errors[data.error] ?? "تعذر إنشاء الطلب. تحققي من البيانات وحاولي مرة أخرى.");
                return;
            }
            const confirmation: OrderConfirmation = data;
            try { sessionStorage.setItem("daisy-order-confirmation", JSON.stringify(confirmation)); } catch { /* order was created; continue to the confirmation page */ }
            try { sessionStorage.removeItem("daisy-checkout-request-id"); } catch { /* the next page load will generate a fresh key */ }
            clear();
            router.replace("/checkout/success");
        } catch {
            setMessage("تعذر الاتصال. لم يتم تأكيد الطلب؛ يمكنك المحاولة مرة أخرى.");
        } finally {
            submitting.current = false;
            setLoading(false);
        }
    }

    if (demoMode) return <main dir={direction} className="mx-auto max-w-[900px] px-6 py-16"><h1 className="text-3xl font-semibold">إتمام الطلب غير متاح</h1><p className="mt-5 text-neutral-600">هذه معاينة لمنتجات وأسعار افتراضية. لا يتم استقبال طلبات أو عمليات شراء في وضع العرض.</p><Link href="/products" className="mt-8 inline-flex bg-neutral-950 px-6 py-3 text-sm text-white">العودة للمعاينة</Link></main>;

    return <main dir={direction} className="mx-auto max-w-[900px] px-6 py-12 sm:py-16">
        <Link href="/cart" className="text-sm underline underline-offset-4">العودة إلى السلة</Link>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">إتمام الطلب</h1>
        {!items.length ? <div className="mt-10 border-y border-neutral-200 py-16 text-center">
            <p className="text-neutral-600">سلتك فارغة حاليًا.</p>
            <Link href="/products" className="mt-5 inline-flex bg-neutral-950 px-6 py-3 text-sm text-white">تصفحي المنتجات</Link>
        </div> : <>
            <p className="mt-4 text-sm text-neutral-600">الدفع عند الاستلام. سيُحسب الإجمالي النهائي والشحن وأي خصم عند تأكيد الطلب.</p>
            <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
                <label className="grid gap-2 text-sm">الاسم الكامل<input name="fullName" required minLength={2} maxLength={120} autoComplete="name" className="min-h-12 border border-neutral-300 px-3" /></label>
                <label className="grid gap-2 text-sm">رقم الهاتف<input name="phone" required minLength={8} maxLength={30} type="tel" autoComplete="tel" className="min-h-12 border border-neutral-300 px-3" /></label>
                <label className="grid gap-2 text-sm">البريد الإلكتروني (اختياري)<input name="email" type="email" autoComplete="email" className="min-h-12 border border-neutral-300 px-3" /></label>
                <label className="grid gap-2 text-sm">المحافظة<input name="governorate" required minLength={2} maxLength={80} autoComplete="address-level1" className="min-h-12 border border-neutral-300 px-3" /></label>
                <label className="grid gap-2 text-sm">المدينة<input name="city" required minLength={2} maxLength={80} autoComplete="address-level2" className="min-h-12 border border-neutral-300 px-3" /></label>
                <label className="grid gap-2 text-sm sm:col-span-2">العنوان بالتفصيل<textarea name="address" required minLength={5} maxLength={300} autoComplete="street-address" rows={3} className="border border-neutral-300 p-3" /></label>
                <label className="grid gap-2 text-sm sm:col-span-2">رمز الخصم (اختياري)<input name="couponCode" maxLength={40} autoComplete="off" className="min-h-12 border border-neutral-300 px-3" /></label>
                {message && <p role="alert" aria-live="polite" className="text-sm text-red-700 sm:col-span-2">{message}</p>}
                <button disabled={loading} className="min-h-12 bg-neutral-950 px-5 py-3 text-white disabled:cursor-wait disabled:opacity-50 sm:col-span-2">
                    {loading ? "جارٍ تأكيد الطلب…" : "تأكيد الطلب عند الاستلام"}
                </button>
            </form>
        </>}
    </main>;
}
