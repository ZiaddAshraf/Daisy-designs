import Link from "next/link";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";

export async function DatabaseUnavailable({ messageKey = "storeUnavailable" }: { messageKey?: TranslationKey }) {
  const locale = await getRequestLocale();
  return <section className="border-y border-neutral-200 py-24 text-center" data-scroll-reveal suppressHydrationWarning><h2 className="text-2xl font-semibold">{getTranslation(locale, messageKey)}</h2><p className="mt-3 text-sm text-neutral-500">{getTranslation(locale, "databaseUnavailableHelp")}</p><Link href="/" className="mt-6 inline-block underline">{getTranslation(locale, "returnHome")}</Link></section>;
}
