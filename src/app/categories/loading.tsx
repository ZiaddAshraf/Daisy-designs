"use client";
import { useTranslation } from "@/components/storefront";
export default function CategoriesLoading() { const t = useTranslation(); return <main role="status" aria-busy="true" aria-label={t("loadingCategories")} className="catalog-page"><div aria-hidden="true" className="catalog-loading-bar" /><div aria-hidden="true" className="catalog-category-grid">{Array.from({ length: 4 }, (_, index) => <div className="catalog-skeleton" key={index} />)}</div></main>; }
