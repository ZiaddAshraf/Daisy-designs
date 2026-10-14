"use client";
import { useTranslation } from "@/components/storefront";
export default function CollectionsLoading() {
  const t = useTranslation();
  return <main role="status" aria-busy="true" aria-label={t("loadingCollections")} className="catalog-page collections-page collections-loading"><div aria-hidden="true">
    <div className="collections-loading__eyebrow" />
    <div className="collections-loading__heading"><span /><span /></div>
    <div className="collections-loading__grid">{Array.from({ length: 4 }, (_, index) => <div key={index}><span className="collections-loading__image" /><span className="collections-loading__line" /><span className="collections-loading__line collections-loading__line--short" /></div>)}</div>
  </div></main>;
}
