import Link from "next/link";
import { getTranslation } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
export default async function CollectionNotFound() { const locale = await getRequestLocale(); const t = (key: "collectionNotFound" | "collectionNotFoundHelp" | "returnToCollections") => getTranslation(locale, key); return <main className="catalog-page"><section className="catalog-empty"><h1>{t("collectionNotFound")}</h1><p>{t("collectionNotFoundHelp")}</p><Link href="/collections" className="daisy-button daisy-button--dark">{t("returnToCollections")}</Link></section></main>; }
