import Link from "next/link";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";

const sections = [
  {
    href: "/categories/banners/wall-banners",
    image: "/products/banners/birthday-banner.jpg",
    badgeAr: "مقاس 1.5*1.5 متر • 600 ج",
    badgeEn: "1.5x1.5m • 600 EGP",
    titleAr: "بانرز الحفلات (1.5*1.5 متر)",
    titleEn: "Celebration Banners (1.5x1.5m)",
    descriptionAr: "بانر احتفالات مخصص: ابعتيلنا صورة الطفل والـ theme المفضل وهنعملك أجمل بانر!",
    descriptionEn: "Custom 1.5x1.5m party banner: send child's photo & theme and we'll craft the perfect banner!",
    ctaAr: "صممي البانر",
    ctaEn: "Customize Banner",
  },
  {
    href: "/categories/banners/toppers",
    image: "/products/toppers/cupcake-toppers-closeup.jpg",
    badgeAr: "باكدج ٣٢ صورة • 200 ج",
    badgeEn: "32-Piece Kit • 200 EGP",
    titleAr: "باكدج توبرز بصورة الطفل",
    titleEn: "Child Photo Cupcake Toppers Kit",
    descriptionAr: "باكدج توبرز كب كيك: 32 صورة مطبوعة للطفل + شمعة لزق + 3 ورقات فوم جليتر ملون + 5 أعواد ملونة + كيس أعواد خشبية.",
    descriptionEn: "Cupcake photo toppers pack: 32 child photos + glue stick + 3 glitter foam sheets + 5 colored sticks + wooden sticks.",
    ctaAr: "صممي باكدج التوبرز",
    ctaEn: "Customize Toppers",
  },
];

export function BannersCategoryLanding({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  return (
    <section className="space-y-6" aria-labelledby="banners-category-heading">
      <div className="text-start">
        <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">DAISY DESIGNS</p>
        <h1 id="banners-category-heading" className="mt-2 text-3xl font-extrabold text-[var(--foreground)]">
          {isAr ? "بانرز وتوبرز" : "Banners & Toppers"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {isAr
            ? "اختاري القسم اللي محتاجاه لدخول صفحته وتخصيص البانر أو باكدج التوبرز لحفلتك."
            : "Choose what you need to customize your party banner or photo toppers kit."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <div className="relative aspect-[4/3] w-full bg-white dark:bg-neutral-900">
              <SiteImage
                src={section.image}
                alt={isAr ? section.titleAr : section.titleEn}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-4 start-4 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-black text-white shadow-md backdrop-blur-md">
                {isAr ? section.badgeAr : section.badgeEn}
              </span>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3 p-5 text-start">
              <div className="flex-1 min-w-[200px]">
                <h2 className="text-xl font-extrabold text-[var(--foreground)]">
                  {isAr ? section.titleAr : section.titleEn}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {isAr ? section.descriptionAr : section.descriptionEn}
                </p>
              </div>
              <span className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-white transition-colors group-hover:bg-amber-600">
                {isAr ? section.ctaAr : section.ctaEn}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
