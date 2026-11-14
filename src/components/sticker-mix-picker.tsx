"use client";

import { useState } from "react";
import SiteImage from "@/components/site-image";
import stickersData from "@/data/stickers-product.json";
import { addStickerDesign, stickerMixTotal, type StickerMix } from "@/lib/sticker-package-mix";
import type { Locale } from "@/lib/locale";

export function StickerMixPicker({ locale, tickets, labels, ticketMix, labelMix, onTicketMix, onLabelMix }: {
  locale: Locale;
  tickets: number;
  labels: number;
  ticketMix: StickerMix;
  labelMix: StickerMix;
  onTicketMix: (mix: StickerMix) => void;
  onLabelMix: (mix: StickerMix) => void;
}) {
  const isAr = locale === "ar";
  const [ticketSearch, setTicketSearch] = useState("");
  const [labelSearch, setLabelSearch] = useState("");
  const sections = [
    { kind: "tickets", count: tickets, mix: ticketMix, change: onTicketMix, search: ticketSearch, setSearch: setTicketSearch, title: isAr ? "اختاري تصميمات الـ٢٠ تيكت" : "Choose ticket designs" },
    { kind: "labels", count: labels, mix: labelMix, change: onLabelMix, search: labelSearch, setSearch: setLabelSearch, title: isAr ? "اختاري تصميمات الـ٢٥ ليبل" : "Choose label designs" },
  ];
  return <div className="space-y-4">
    {sections.filter(section => section.count > 0).map(section => {
      const total = stickerMixTotal(section.mix);
      const available = stickersData.product.designs.filter(design =>
        !section.mix[design.slug] &&
        (isAr ? design.arabicTitle : design.title).toLowerCase().includes(section.search.trim().toLowerCase())
      );
      return <section key={section.kind} className="rounded-2xl border border-[var(--border)] p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold">{section.title}</h3>
          <span className={`text-xs font-bold ${total === section.count ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
            {isAr ? `${total} من ${section.count}` : `${total} / ${section.count}`}
          </span>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          {isAr ? "ممكن تقسّمي العدد على أكتر من تصميم. حددي عدد كل تصميم." : "Split the pack across multiple designs. Set the quantity for each design."}
        </p>
        <div className="space-y-2">
          {Object.entries(section.mix).filter(([, count]) => count > 0).map(([slug, count]) => {
            const design = stickersData.product.designs.find(item => item.slug === slug);
            if (!design) return null;
            return <div key={slug} className="flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] p-2">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                <SiteImage src={design.url} alt={isAr ? design.arabicTitle : design.title} fill sizes="48px" className="object-contain" />
              </div>
              <span className="min-w-0 flex-1 text-xs font-semibold">{isAr ? design.arabicTitle : design.title}</span>
              <input type="number" min="1" max={section.count} step="1" value={count}
                aria-label={isAr ? `عدد ${section.kind === "tickets" ? "التيكت" : "الليبل"} بتصميم ${design.arabicTitle}` : `Quantity of ${design.title} ${section.kind}`}
                onChange={event => {
                  const nextCount = Number(event.target.value);
                  if (Number.isInteger(nextCount) && nextCount >= 1 && nextCount <= section.count) section.change({ ...section.mix, [slug]: nextCount });
                }}
                className="w-16 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-center text-sm" />
              <button type="button" onClick={() => {
                const next = { ...section.mix };
                delete next[slug];
                section.change(next);
              }} aria-label={isAr ? `إزالة ${design.arabicTitle}` : `Remove ${design.title}`} className="min-h-10 min-w-10 rounded-lg text-rose-600">×</button>
            </div>;
          })}
        </div>
        <div className="flex gap-2">
          <input type="search" value={section.search} onChange={event => section.setSearch(event.target.value)}
            placeholder={isAr ? "ابحثي عن تصميم تاني" : "Search another design"}
            aria-label={isAr ? "البحث عن تصميم" : "Search designs"}
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm" />
          <select aria-label={isAr ? "إضافة تصميم" : "Add a design"} value="" onChange={event => {
            if (event.target.value) section.change(addStickerDesign(section.mix, event.target.value, section.count));
            section.setSearch("");
          }} className="min-w-0 max-w-[45%] rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs">
            <option value="">{isAr ? "إضافة تصميم" : "Add design"}</option>
            {available.map(design => <option key={design.slug} value={design.slug}>{isAr ? design.arabicTitle : design.title}</option>)}
          </select>
        </div>
        {total !== section.count && <p className="text-xs font-semibold text-rose-600" role="status">
          {isAr ? `لازم مجموع ${section.kind === "tickets" ? "التيكت" : "الليبل"} يكون ${section.count} بالضبط.` : `The ${section.kind} total must be exactly ${section.count}.`}
        </p>}
      </section>;
    })}
  </div>;
}
