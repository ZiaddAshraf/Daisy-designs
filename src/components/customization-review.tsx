"use client";
export function CustomizationReview({ isAr, rows, editTarget }: { isAr: boolean; rows: [string, string][]; editTarget: string }) {
  return <section aria-label={isAr ? "راجعي تفاصيل طلبك" : "Review your choices"} className="my-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-start" data-customization-review>
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-bold text-sm">{isAr ? "راجعي التفاصيل قبل الإضافة للسلة" : "Review before adding to cart"}</h3>
      <button type="button" className="min-h-11 shrink-0 text-sm underline" onClick={() => {
        const target = document.getElementById(editTarget);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = target?.matches("input, textarea, select") ? target : target?.querySelector<HTMLElement>("input, textarea, select, button");
        (input as HTMLElement | null)?.focus({ preventScroll: true });
      }}>{isAr ? "تعديل" : "Edit"}</button>
    </div>
    <dl className="space-y-2 text-sm">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"><dt className="text-[var(--muted-foreground)]">{label}</dt><dd className="m-0 break-words whitespace-pre-wrap font-medium" dir="auto">{value || (isAr ? "لم يُحدد بعد" : "Not selected yet")}</dd></div>)}</dl>
    <p className="mt-3 text-xs text-[var(--muted-foreground)]">{isAr ? "راجعي كتابة الاسم والمقاس كويس؛ دي التفاصيل اللي هتتبعت مع الطلب." : "Check spelling and sizes carefully. These choices will be sent with your order."}</p>
  </section>;
}
