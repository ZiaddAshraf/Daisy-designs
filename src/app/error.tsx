"use client";
import { useTranslation } from "@/components/storefront";
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslation();
  return <main className="mx-auto max-w-xl px-6 py-32 text-center" role="alert" data-scroll-reveal suppressHydrationWarning>
    <h1 className="text-3xl font-semibold">{t("unexpectedErrorTitle")}</h1>
    <p className="mt-4 text-neutral-500">{t("unexpectedErrorDescription")}</p>
    <button onClick={retry} className="mt-8 bg-neutral-950 px-6 py-3 text-sm text-white">{t("retry")}</button>
  </main>;
}
