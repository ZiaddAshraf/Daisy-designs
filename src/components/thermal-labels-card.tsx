import Link from "next/link";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";
import { THERMAL_LABEL_SLUG } from "@/lib/ensure-thermal-label-product";

export function ThermalLabelsCard({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  return <section className="mb-8 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-4 shadow-sm dark:border-teal-900 dark:from-teal-950/60 dark:via-[var(--card)] dark:to-amber-950/20 sm:p-6" aria-labelledby="thermal-labels-heading">
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-white">
        <SiteImage src="/products/stickers/thermal-labels-10-pack.jpg" alt={isAr ? "أمثلة ليبل حراري للأطفال" : "Personalized thermal label examples"} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
      </div>
      <div className="text-start">
        <span className="mb-2 inline-block rounded-full bg-teal-700 px-3 py-1 text-xs font-extrabold text-white">{isAr ? "ليبل حراري للملابس" : "IRON-ON CLOTHING LABELS"}</span>
        <h2 id="thermal-labels-heading" className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl">{isAr ? "ليبل حراري مخصص - ١٠ قطع" : "Custom Thermal Labels - 10 Pack"}</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{isAr ? "باقة ١٠ قطع باسم طفلك. اختاري التصميم واكتبي البيانات مرة واحدة للباقة." : "A pack of 10 personalized labels. Choose a design and enter the details once for the pack."}</p>
        <p className="mt-4 text-xl font-extrabold text-teal-800 dark:text-teal-300">{isAr ? "١٥٠ ج.م للباقة" : "EGP 150 per pack"}</p>
        <Link href={`/products/${THERMAL_LABEL_SLUG}`} className="mt-4 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-zinc-700">{isAr ? "اختاري الليبل الحراري" : "Choose thermal labels"}</Link>
      </div>
    </div>
  </section>;
}
