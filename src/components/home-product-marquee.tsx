import Image from "@/components/site-image";
import Link from "next/link";
import type { Locale } from "@/lib/locale";

const galleryImages = [
  ...Array.from({ length: 10 }, (_, index) => ({
    src: `/products/reward-cards/card-${String(index + 1).padStart(2, "0")}-${[
      "you-can-do-it", "bee-happy", "youre-a-superstar", "sprinkles-ice-cream", "berry-berry-much",
      "have-a-good-day", "happy-as-a-hippo", "you-are-affirmations", "never-give-up", "i-love-you",
    ][index]}.jpeg`,
    href: "/products/reward-cards-box-set",
    alt: index === 0 ? "You can do it reward card" : `Reward card design ${index + 1}`,
    arabicAlt: index === 0 ? "بطاقة تشجيع: يمكنك فعلها" : `تصميم بطاقة تشجيع ${index + 1}`,
  })),
  { src: "/products/stickers/custom-sticker-design.svg", href: "/products/custom-waterproof-stickers", alt: "Custom sticker design", arabicAlt: "استيكر بتصميم مخصص" },
  { src: "/products/t-shirts/white-tshirt.svg", href: "/products/custom-printed-tshirt", alt: "White printed T-shirt", arabicAlt: "تيشيرت أبيض للطباعة" },
];

function ProductTile({ image, locale }: { image: (typeof galleryImages)[number]; locale: Locale }) {
  const alt = locale === "ar" ? image.arabicAlt : image.alt;
  return <Link href={image.href} className="daisy-home-marquee__tile" aria-label={`${locale === "ar" ? "اكتشفي" : "Explore"} ${alt}`}>
    <Image src={image.src} alt={alt} fill sizes="(max-width: 650px) 46vw, 16vw" />
  </Link>;
}

export function HomeProductMarquee({ isRtl }: { isRtl: boolean }) {
  const direction = isRtl ? "rtl" : "ltr";
  const locale: Locale = isRtl ? "ar" : "en";

  return <div className="daisy-home-marquee" dir={direction}>
    <div className="daisy-home-marquee__viewport" role="region" aria-label={isRtl ? "منتجات دايزي" : "Daisy products"}>
      <div className="daisy-home-marquee__track">
        {[0, 1].map((copy) => <div className="daisy-home-marquee__group" key={copy} aria-hidden={copy === 1} inert={copy === 1}>
          {galleryImages.map((image, index) => <ProductTile image={image} locale={locale} key={`${copy}-${index}-${image.src}`} />)}
        </div>)}
      </div>
    </div>
  </div>;
}
