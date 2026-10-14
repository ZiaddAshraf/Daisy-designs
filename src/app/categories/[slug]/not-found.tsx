import Link from "next/link";
import { getTranslation } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
export default async function CategoryNotFound() { const locale = await getRequestLocale(); const t = (key: "categoryNotFound" | "categoryNotFoundHelp" | "returnToCategories") => getTranslation(locale, key); return <main className="catalog-page"><section className="catalog-empty"><h1>{t("categoryNotFound")}</h1><p>{t("categoryNotFoundHelp")}</p><Link href="/categories" className="daisy-button daisy-button--dark">{t("returnToCategories")}</Link></section></main>; }
