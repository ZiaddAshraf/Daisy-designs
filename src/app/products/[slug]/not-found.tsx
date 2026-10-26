import Link from "next/link";
import { getRequestLocale } from "@/lib/locale-server";
import { directionForLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/i18n/messages";

export default async function ProductNotFound() {
    const locale = await getRequestLocale();
    const t = (key: "productNotFound" | "productNotFoundHelp" | "returnToStore") => getTranslation(locale, key);
    return <main className="mx-auto max-w-xl px-6 py-32 text-center" dir={directionForLocale(locale)}>
        <h1 className="text-3xl font-semibold">{t("productNotFound")}</h1>
        <p className="mt-4 text-neutral-500">{t("productNotFoundHelp")}</p>
        <Link href="/products" className="mt-8 inline-block bg-neutral-950 px-6 py-3 text-sm text-white">{t("returnToStore")}</Link>
    </main>;
}
