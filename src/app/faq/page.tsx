import type { Metadata } from "next";
import Link from "next/link";
import { getRequestLocale } from "@/lib/locale-server";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";

const translate = (locale: "ar" | "en", key: TranslationKey) => getTranslation(locale, key);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "faqMetadataTitle"),
    description: translate(locale, "faqMetadataDescription"),
  };
}

export default async function FaqPage() {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => translate(locale, key);
  const groups = [
    {
      title: t("faqOrderingGroup"),
      id: "faq-orders",
      questions: [
        ["faqPreparationQuestion", "faqPreparationAnswer"],
        ["faqNameChangeQuestion", "faqNameChangeAnswer"],
      ] as const,
    },
    {
      title: t("faqDeliveryGroup"),
      id: "faq-delivery",
      questions: [
        ["faqPaymentQuestion", "faqPaymentAnswer"],
        ["faqTrackingQuestion", "faqTrackingAnswer"],
      ] as const,
    },
  ];

  return (
    <main className="faq-page">
      <header className="faq-intro" data-scroll-reveal suppressHydrationWarning>
        <p className="faq-eyebrow">DAISY DESIGNS <span aria-hidden="true">/</span> {t("faqEyebrow")}</p>
        <div className="faq-intro-copy">
          <h1>{t("faqTitle")}</h1>
          <p>{t("faqIntro")}</p>
        </div>
      </header>

      <div className="faq-groups">
        {groups.map((group) => (
          <section className="faq-group" key={group.id} aria-labelledby={`${group.id}-title`} data-scroll-reveal suppressHydrationWarning>
            <h2 id={`${group.id}-title`}>{group.title}</h2>
            <div className="faq-list">
              {group.questions.map(([questionKey, answerKey]) => (
                <details className="faq-item" key={questionKey}>
                  <summary>{t(questionKey)}<span className="faq-indicator" aria-hidden="true" /></summary>
                  <div className="faq-answer"><p>{t(answerKey)}</p></div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="faq-contact" aria-labelledby="faq-contact-title" data-scroll-reveal suppressHydrationWarning>
        <div>
          <h2 id="faq-contact-title">{t("faqContactTitle")}</h2>
          <p>{t("faqContactIntro")}</p>
        </div>
        <Link href="/contact">{t("faqContactCta")}<span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
