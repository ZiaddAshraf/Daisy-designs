"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";

type Confirmation = {
    number: string;
    total: number;
    items: { productName: string; quantity: number; unitPrice: number; customization?: Record<string, string> }[];
};

export default function CheckoutSuccessPage() {
    const locale = useLocale();
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

    return <main dir={directionForLocale(locale)} className="mx-auto max-w-[760px] px-6 py-16 sm:py-24">
        <p className="text-xs tracking-[.2em] text-neutral-500">DAISY DESIGNS / تأكيد الطلب</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{confirmation ? "تم استلام طلبك بنجاح" : "تأكيد الطلب"}</h1>
        {confirmation ? <>
            <p className="mt-4 text-neutral-600">رقم الطلب: <strong dir="ltr">{confirmation.number}</strong></p>
            <section aria-label="تفاصيل الطلب" className="mt-8 border-y border-neutral-200">
                {confirmation.items.map((item, index) => <div key={`${item.productName}-${index}`} className="flex flex-wrap justify-between gap-3 border-b border-neutral-100 py-4 last:border-0">
                    <div><p>{item.productName} <span className="text-neutral-500">× {item.quantity}</span></p>
                        {item.customization && Object.entries(item.customization).map(([key, value]) => <p key={key} className="mt-1 text-xs text-neutral-500">{key}: {value}</p>)}
                    </div>
                    <span>{item.unitPrice.toLocaleString("ar-EG")} ج.م</span>
                </div>)}
            </section>
            <p className="mt-5 flex justify-between"><span>الإجمالي شامل الشحن والخصم</span><strong>{confirmation.total.toLocaleString("ar-EG")} ج.م</strong></p>
            <p className="mt-3 text-sm text-neutral-600">طريقة الدفع: عند الاستلام</p>
        </> : <p className="mt-4 text-neutral-600">لا توجد تفاصيل محفوظة لهذه الجلسة. إذا أكملتِ الطلب، ستجدين تفاصيله في حسابك.</p>}
        <Link href="/products" className="mt-8 inline-flex min-h-12 items-center bg-neutral-950 px-6 text-sm text-white">متابعة التسوق</Link>
    </main>;
}
