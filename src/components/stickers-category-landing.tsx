import Link from "next/link";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";

const sections = [
  {
    href: "/categories/stickers/tickets-labels",
    image: "/products/stickers/tickets-labels-studio.jpeg",
    titleAr: "التيكت والليبل",
    titleEn: "Tickets & Labels",
    descriptionAr: "اختاري باقة التيكت والليبل ووزّعي القطع على التصميمات اللي تحبيها.",
    descriptionEn: "Choose a pack and mix your favorite ticket and label designs.",
  },
  {
    href: "/categories/stickers/keychains",
    image: "/products/keychains/keychains-collection.jpeg",
    titleAr: "الميداليات",
    titleEn: "Keychains",
    descriptionAr: "ميداليات أكريليك باسم طفلك للشنط والمفاتيح.",
    descriptionEn: "Personalized acrylic name keychains for bags and keys.",
  },
];

export function StickersCategoryLanding({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  return <section className="space-y-6" aria-labelledby="stickers-category-heading">
    <div className="text-start">
      <p className="text-xs font-extrabold text-teal-700 dark:text-teal-400">DAISY DESIGNS</p>
      <h1 id="stickers-category-heading" className="mt-2 text-3xl font-extrabold text-[var(--foreground)]">
        {isAr ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {isAr ? "اختاري اللي محتاجاه وادخلي صفحته عشان تشوفي التصميمات وتطلبي." : "Choose what you need to browse designs and order."}
      </p>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      {sections.map(section => <Link key={section.href} href={section.href}
        className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
        <div className="relative aspect-[3/2] bg-white">
          <SiteImage src={section.image} alt={isAr ? section.titleAr : section.titleEn} fill
            sizes="(max-width: 768px) 100vw, 50vw" className="object-contain transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 p-5 text-start">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--foreground)]">{isAr ? section.titleAr : section.titleEn}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{isAr ? section.descriptionAr : section.descriptionEn}</p>
          </div>
          <span className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-extrabold text-white group-hover:bg-teal-800">
            {isAr ? "تصفحي التصميمات" : "Browse designs"}
          </span>
        </div>
      </Link>)}
    </div>
  </section>;
}
