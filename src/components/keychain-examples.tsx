import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/locale";

const examples = [
  {
    slug: "custom-acrylic-name-keychain",
    image: "/products/keychains/personalized-name-tags-examples.jpg",
    ar: "ميدالية اسم بتصميمك",
    en: "Custom name keychain",
  },
  {
    slug: "keychain-lamine-yamal",
    image: "/products/keychains/yamal-name-keychain-example.jpg",
    ar: "ميدالية لامين يامال",
    en: "Lamine Yamal keychain",
  },
  {
    slug: "keychain-cristiano-ronaldo",
    image: "/products/keychains/ronaldo-name-keychain-example.jpg",
    ar: "ميدالية كريستيانو رونالدو",
    en: "Cristiano Ronaldo keychain",
  },
];

export function KeychainExamples({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  return (
    <section id="keychain-examples" className="mb-8 scroll-mt-24 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-4 shadow-sm dark:border-teal-900 dark:from-teal-950/60 dark:via-[var(--card)] dark:to-amber-950/20 sm:p-6" aria-labelledby="keychain-examples-heading">
      <div className="mb-5">
        <span className="mb-2 inline-block rounded-full bg-teal-700 px-3 py-1 text-xs font-extrabold text-white">{isAr ? "ميداليات مخصصة" : "CUSTOM KEYCHAINS"}</span>
        <h1 id="keychain-examples-heading" className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl">
          {isAr ? "ميداليات بأسماء الأطفال" : "Personalized Name Keychains"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {isAr ? "ميدالية للشنطة أو المفاتيح باسم طفلك. شوّفي الصور واختاري التصميم اللي تحبيه." : "A personalized keychain for your child's bag or keys. Browse the photos and choose a design."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <Link
            key={example.slug}
            href={`/products/${example.slug}`}
            className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <div className="relative aspect-[3/2] bg-white">
              <Image
                src={example.image}
                alt={isAr ? example.ar : example.en}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 p-4">
              <h2 className="text-sm font-extrabold text-[var(--foreground)]">{isAr ? example.ar : example.en}</h2>
              <span className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-extrabold text-white transition-colors group-hover:bg-teal-800">
                {isAr ? "اختاري الميدالية" : "Choose keychain"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
