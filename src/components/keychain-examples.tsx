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
    <section className="mt-14 border-t border-[var(--border)] pt-9" aria-labelledby="keychain-examples-heading">
      <div className="mb-6">
        <h2 id="keychain-examples-heading" className="text-2xl font-extrabold text-[var(--foreground)]">
          {isAr ? "ميداليات بأسماء الأطفال" : "Personalized Name Keychains"}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {isAr ? "اختاري التصميم واكتبي اسم طفلك عند الطلب." : "Choose a design and add your child's name when ordering."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <Link
            key={example.slug}
            href={`/products/${example.slug}`}
            className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <div className="relative aspect-[4/3] bg-white">
              <Image
                src={example.image}
                alt={isAr ? example.ar : example.en}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <h3 className="text-sm font-bold text-[var(--foreground)]">{isAr ? example.ar : example.en}</h3>
              <span className="shrink-0 text-xs font-semibold text-teal-700 dark:text-teal-400">
                {isAr ? "عرض المنتج" : "View product"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
