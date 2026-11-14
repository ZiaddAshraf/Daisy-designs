import Link from "next/link";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";

export function ThermalLabelsCard({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  return <article className="catalog-card group flex flex-col justify-between overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--card)] shadow-[0_2px_14px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-600/50 hover:shadow-[0_14px_34px_rgba(0,0,0,0.09)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
    <Link href="/products/custom-thermal-clothing-labels" className="block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white p-1 sm:p-1.5">
        <SiteImage src="/products/stickers/thermal-labels-10-pack.jpg" alt={isAr ? "أمثلة ليبل حراري للأطفال" : "Personalized thermal label examples"} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4 text-start sm:p-5">
        <span className="mb-1.5 block text-xs font-bold text-teal-700 dark:text-teal-400">{isAr ? "ليبل حراري للملابس" : "Iron-on clothing labels"}</span>
        <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">{isAr ? "ليبل حراري مخصص - ١٠ قطع" : "Custom Thermal Labels - 10 Pack"}</h2>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">{isAr ? "١٠ قطع باسم طفلك في باقة واحدة." : "10 personalized labels in one pack."}</p>
      </div>
    </Link>
    <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] p-4 text-start">
      <Link href="/products/custom-thermal-clothing-labels" className="rounded-xl bg-neutral-900 px-4 py-3 text-xs font-extrabold text-white hover:bg-neutral-700">{isAr ? "اختاري الليبل" : "Choose labels"}</Link>
      <strong className="text-base font-extrabold text-teal-800 dark:text-teal-300">{isAr ? "١٥٠ ج.م" : "EGP 150"}</strong>
    </div>
  </article>;
}
