import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";

const message = (locale: "ar" | "en", key: TranslationKey) => getTranslation(locale, key);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: message(locale, "aboutMetadataTitle"),
    description: message(locale, "aboutMetadataDescription"),
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => message(locale, key);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <main className="about-page">
      <header className="about-hero" data-scroll-reveal suppressHydrationWarning>
        <div className="about-hero-copy">
          <p className="about-eyebrow">DAISY DESIGNS <span aria-hidden="true">/</span> {t("aboutEyebrow")}</p>
          <h1>{t("aboutTitle")}</h1>
          <p className="about-intro">{t("aboutIntro")}</p>
        </div>
        <div className="about-wordmark" aria-hidden="true" dir="ltr">
          <span>DAISY</span>
          <span className="about-wordmark-second">DESIGNS</span>
          <span className="about-wordmark-rule" />
        </div>
      </header>

      <section className="about-story" aria-labelledby="about-question-title" data-scroll-reveal suppressHydrationWarning>
        <p className="about-section-label">{t("aboutEyebrow")}</p>
        <div className="about-story-copy">
          <h2 id="about-question-title">{t("aboutQuestionTitle")}</h2>
          <blockquote>{t("aboutQuestion")}</blockquote>
          <p>{t("aboutQuestionAnswer")}</p>
        </div>
      </section>

      <section className="about-everyday" aria-labelledby="about-everyday-title" data-scroll-reveal suppressHydrationWarning>
        <p className="about-section-label">DAISY <span aria-hidden="true">/</span> {t("aboutEyebrow")}</p>
        <div className="about-everyday-copy">
          <h2 id="about-everyday-title">{t("aboutEverydayTitle")}</h2>
          <p>{t("aboutEverydayBody")}</p>
        </div>
        <p className="about-edition" aria-hidden="true">D<span>.</span></p>
      </section>

      <section className="about-closing" aria-labelledby="about-closing-title" data-scroll-reveal suppressHydrationWarning>
        <p className="about-section-label">{t("aboutEyebrow")}</p>
        <h2 id="about-closing-title">{t("aboutClosingTitle")}</h2>
        <p>{t("aboutClosingBody")}</p>
        <Link className="about-cta" href="/products">
          {t("aboutExploreProducts")}
          <Arrow aria-hidden="true" size={16} strokeWidth={1.5} />
        </Link>
      </section>
    </main>
  );
}
