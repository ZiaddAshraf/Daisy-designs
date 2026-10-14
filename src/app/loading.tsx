"use client";

import { useTranslation } from "@/components/storefront";

export default function Loading() { const t = useTranslation(); return <main role="status" aria-busy="true" aria-label={t("loading")} className="mx-auto max-w-[1400px] px-6 py-24 lg:px-16"><div aria-hidden="true" className="h-4 w-24 animate-pulse bg-neutral-200" /><div aria-hidden="true" className="mt-6 h-12 w-72 animate-pulse bg-neutral-200" /><div aria-hidden="true" className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-neutral-100" />)}</div></main>; }
