"use client";

import { useEffect, useState } from "react";
import SiteImage from "@/components/site-image";
import stickersData from "@/data/stickers-product.json";
import { addStickerDesign, stickerMixTotal, type StickerMix } from "@/lib/sticker-package-mix";
import type { Locale } from "@/lib/locale";

export function StickerMixPicker({ locale, tickets, labels, ticketMix, labelMix, onTicketMix, onLabelMix, showGallery = true }: {
  locale: Locale;
  tickets: number;
  labels: number;
  ticketMix: StickerMix;
  labelMix: StickerMix;
  onTicketMix: (mix: StickerMix) => void;
  onLabelMix: (mix: StickerMix) => void;
  showGallery?: boolean;
}) {
  const isAr = locale === "ar";
  const [ticketSearch, setTicketSearch] = useState("");
  const [labelSearch, setLabelSearch] = useState("");
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const previewDesign = stickersData.product.designs.find(design => design.slug === previewSlug);
  useEffect(() => {
    if (!previewSlug) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setPreviewSlug(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [previewSlug]);
  const sections = [
    { kind: "tickets", count: tickets, mix: ticketMix, change: onTicketMix, search: ticketSearch, setSearch: setTicketSearch, title: isAr ? "اختاري تصميمات الـ٢٠ تيكت" : "Choose ticket designs" },
    { kind: "labels", count: labels, mix: labelMix, change: onLabelMix, search: labelSearch, setSearch: setLabelSearch, title: isAr ? "اختاري تصميمات الـ٢٥ ليبل" : "Choose label designs" },
  ];
  return <div className="space-y-4">
    {sections.filter(section => section.count > 0 && (showGallery || stickerMixTotal(section.mix) > 0)).map(section => {
      const total = stickerMixTotal(section.mix);
      const visibleDesigns = stickersData.product.designs.filter(design =>
        (isAr ? design.arabicTitle : design.title).toLowerCase().includes(section.search.trim().toLowerCase())
      );
      const canAdd = total < section.count || Object.values(section.mix).some(count => count > 1);
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
        {total === 0 && <p className="text-xs text-[var(--muted-foreground)]">{isAr ? "اختاري أول تصميم من الصور اللي تحت." : "Choose the first design from the photos below."}</p>}
        {showGallery && <div className="space-y-2">
          <label className="block text-xs font-bold" htmlFor={`sticker-search-${section.kind}`}>
            {isAr ? "شوّفي صور التصميمات واختاري منها" : "Browse designs by photo"}
          </label>
          <input id={`sticker-search-${section.kind}`} type="search" value={section.search} onChange={event => section.setSearch(event.target.value)}
            placeholder={isAr ? "ابحثي عن شخصية أو تصميم" : "Search characters or designs"}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm" />
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {isAr ? "اضغطي على الصورة لتكبيرها. الصورة نموذج، والاسم هيتطبع حسب بيانات الطلب." : "Tap a photo to enlarge it. Names shown are examples."}
          </p>
          <div className="max-h-[430px] overflow-y-auto rounded-xl border border-[var(--border)] p-2">
            <div className="grid grid-cols-2 gap-2">
              {visibleDesigns.map(design => {
                const selected = Boolean(section.mix[design.slug]);
                return <div key={design.slug} className={`overflow-hidden rounded-xl border bg-[var(--card)] ${selected ? "border-teal-600 ring-1 ring-teal-600" : "border-[var(--border)]"}`}>
                  <button type="button" onClick={() => setPreviewSlug(design.slug)}
                    aria-label={isAr ? `تكبير صورة ${design.arabicTitle}` : `Enlarge ${design.title}`}
                    className="block w-full cursor-zoom-in">
                    <span className="relative block aspect-[3/4] w-full bg-white">
                      <SiteImage src={design.url} alt={isAr ? design.arabicTitle : design.title} fill sizes="(max-width: 640px) 45vw, 180px" className="object-contain" />
                    </span>
                  </button>
                  <div className="p-2 space-y-2">
                    <p className="min-h-8 text-[11px] font-semibold leading-4 line-clamp-2">{isAr ? design.arabicTitle : design.title}</p>
                    <button type="button" disabled={selected || !canAdd}
                      onClick={() => section.change(addStickerDesign(section.mix, design.slug, section.count))}
                      className={`w-full min-h-9 rounded-lg px-2 text-xs font-bold ${selected ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300" : "bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50"}`}>
                      {selected ? (isAr ? "✓ تم الاختيار" : "✓ Selected") : (isAr ? "أضيفي التصميم" : "Add design")}
                    </button>
                  </div>
                </div>;
              })}
            </div>
            {visibleDesigns.length === 0 && <p className="p-4 text-center text-xs text-[var(--muted-foreground)]">{isAr ? "مفيش تصميمات مطابقة" : "No matching designs"}</p>}
          </div>
        </div>}
        {total !== section.count && <p className="text-xs font-semibold text-rose-600" role="status">
          {isAr ? `لازم مجموع ${section.kind === "tickets" ? "التيكت" : "الليبل"} يكون ${section.count} بالضبط.` : `The ${section.kind} total must be exactly ${section.count}.`}
        </p>}
      </section>;
    })}
    {previewDesign && <div role="dialog" aria-modal="true" aria-label={isAr ? `صورة ${previewDesign.arabicTitle}` : `Photo of ${previewDesign.title}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-6" onClick={() => setPreviewSlug(null)}>
      <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--card)] p-3" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 pb-2">
          <strong className="text-sm">{isAr ? previewDesign.arabicTitle : previewDesign.title}</strong>
          <button type="button" onClick={() => setPreviewSlug(null)} aria-label={isAr ? "إغلاق الصورة" : "Close photo"} className="min-h-10 min-w-10 rounded-full bg-[var(--surface-soft)] text-xl">×</button>
        </div>
        <div className="relative min-h-0 flex-1 aspect-[3/4] w-full bg-white">
          <SiteImage src={previewDesign.url} alt={isAr ? previewDesign.arabicTitle : previewDesign.title} fill sizes="(max-width: 640px) 95vw, 600px" className="object-contain" />
        </div>
        <p className="pt-2 text-center text-xs text-[var(--muted-foreground)]">{isAr ? "الصورة نموذج، والاسم والبيانات حسب طلبك." : "Example image; your name and details will be personalized."}</p>
      </div>
    </div>}
  </div>;
}
