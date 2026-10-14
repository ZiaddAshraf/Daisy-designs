"use client";

import { useTranslation } from "@/components/storefront";

export default function ProductsLoading() {
  const t = useTranslation();
  return <main role="status" aria-busy="true" aria-label={t("loadingProducts")} className="catalog-page catalog-loading">
    <div aria-hidden="true">
      <div className="catalog-loading__breadcrumb"><span className="catalog-loading__shimmer" /></div>
      <div className="catalog-loading__heading">
        <div><span className="catalog-loading__shimmer catalog-loading__eyebrow" /><span className="catalog-loading__shimmer catalog-loading__title" /><span className="catalog-loading__shimmer catalog-loading__description" /></div>
        <span className="catalog-loading__shimmer catalog-loading__search" />
      </div>
      <div className="catalog-loading__count"><span className="catalog-loading__shimmer" /></div>
      <div className="catalog-loading__filters">
        {Array.from({ length: 6 }, (_, index) => <span key={index} className="catalog-loading__shimmer" />)}
        <span className="catalog-loading__shimmer catalog-loading__apply" />
      </div>
      <div className="catalog-loading__grid">
        {Array.from({ length: 8 }, (_, index) => <div key={index}>
          <span className="catalog-loading__shimmer catalog-loading__media" />
          <span className="catalog-loading__shimmer catalog-loading__line" />
          <span className="catalog-loading__shimmer catalog-loading__line catalog-loading__line--short" />
        </div>)}
      </div>
    </div>
  </main>;
}
