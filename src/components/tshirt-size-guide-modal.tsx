"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/locale";
import { X, Ruler, Info, Check, Users, Baby } from "lucide-react";

type TShirtSizeGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  activeSize?: string;
};

// Exact source measurements from D:\esssam\Size chart\WhatsApp Image 2026-10-17 at 2.46.25 AM (2).jpeg
export const ADULT_SIZES = [
  { size: "S", widthCm: 50, lengthCm: 70 },
  { size: "M", widthCm: 52, lengthCm: 72 },
  { size: "L", widthCm: 54, lengthCm: 74 },
  { size: "XL", widthCm: 56, lengthCm: 76 },
  { size: "XXL", widthCm: 58, lengthCm: 78 },
] as const;

// Exact source measurements from D:\esssam\Size chart\WhatsApp Image 2026-10-17 at 2.46.25 AM (1).jpeg
export const CHILDREN_SIZES = [
  { size: "2", widthCm: 32, lengthCm: 45 },
  { size: "4", widthCm: 34, lengthCm: 47 },
  { size: "6", widthCm: 36, lengthCm: 49 },
  { size: "8", widthCm: 38, lengthCm: 52 },
  { size: "10", widthCm: 40, lengthCm: 54 },
  { size: "12", widthCm: 42, lengthCm: 56 },
  { size: "14", widthCm: 44, lengthCm: 58 },
  { size: "16", widthCm: 46, lengthCm: 60 },
] as const;

export function TShirtSizeGuideModal({
  isOpen,
  onClose,
  locale,
  activeSize,
}: TShirtSizeGuideModalProps) {
  const isAr = locale === "ar";
  const modalRef = useRef<HTMLDivElement>(null);

  const isAdultActive = Boolean(
    activeSize && ["S", "M", "L", "XL", "XXL"].includes(activeSize.toUpperCase())
  );
  const [selectedCategory, setSelectedCategory] = useState<"adults" | "children" | null>(null);
  const sizeCategory = selectedCategory ?? (isAdultActive ? "adults" : "children");

  // Close on Escape key & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Lock background scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSizes = sizeCategory === "adults" ? ADULT_SIZES : CHILDREN_SIZES;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Blurred Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div
        ref={modalRef}
        className="relative z-10 flex w-full max-w-2xl flex-col max-h-[92vh] rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Ruler size={20} />
            </div>
            <div>
              <h2
                id="size-guide-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100"
              >
                {isAr ? "دليل مقاسات التيشيرت (كبار وأطفال)" : "T-Shirt Size Guide (Adults & Kids)"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                {isAr
                  ? "جميع المقاسات بالسنتيمتر (سم) حسب جدول القياسات المعتمد"
                  : "All measurements in centimeters (cm) according to the verified size chart"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? "إغلاق دليل المقاسات" : "Close Size Guide"}
            className="flex h-11 w-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Segmented Category Switcher (Adults vs Children) */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-neutral-800/70 border border-slate-200/60 dark:border-neutral-700/60">
            <button
              type="button"
              onClick={() => setSelectedCategory("adults")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                sizeCategory === "adults"
                  ? "bg-white text-teal-700 shadow-xs dark:bg-neutral-900 dark:text-teal-300 ring-1 ring-slate-200/80 dark:ring-neutral-700"
                  : "text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <Users size={16} />
              <span>{isAr ? "مقاسات الكبار (S - XXL)" : "Adult Sizes (S - XXL)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("children")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                sizeCategory === "children"
                  ? "bg-white text-teal-700 shadow-xs dark:bg-neutral-900 dark:text-teal-300 ring-1 ring-slate-200/80 dark:ring-neutral-700"
                  : "text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <Baby size={16} />
              <span>{isAr ? "مقاسات الأطفال (سن ٢ - ١٦)" : "Children Sizes (2 - 16)"}</span>
            </button>
          </div>

          {/* Measurement Visual Diagram & Terminology */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 dark:border-neutral-800/80 dark:bg-neutral-800/40">
            <div className="grid gap-4 sm:grid-cols-12 sm:items-center">
              {/* Diagram Asset Container */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-2 shadow-xs dark:border-neutral-700 dark:bg-neutral-900 max-w-[200px] sm:max-w-none">
                  <Image
                    src="/size-charts/measurement-guide-diagram.jpeg"
                    alt={isAr ? "مخطط قياس التيشيرت: الطول والعرض والكم" : "T-Shirt Measurement Guide Diagram"}
                    width={320}
                    height={320}
                    className="h-auto w-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Terminology Explanation from the Diagram */}
              <div className="sm:col-span-7 space-y-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-neutral-300">
                <h3 className="font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Ruler size={14} className="text-teal-600 dark:text-teal-400" />
                  {isAr ? "طريقة أخذ القياس الصحيحة" : "How to Measure Correctly"}
                </h3>
                <p>
                  <strong className="text-slate-900 dark:text-neutral-100">
                    {isAr ? "العرض (Width):" : "Width:"}
                  </strong>{" "}
                  {isAr
                    ? "يُقاس أفقياً من تحت الإبط إلى الإبط المقابل عبر الصدر."
                    : "Measured horizontally across the chest from armpit to armpit."}
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-neutral-100">
                    {isAr ? "الطول (Length):" : "Length:"}
                  </strong>{" "}
                  {isAr
                    ? "يُقاس رأسياً من أعلى نقطة في الكتف حتى نهاية الحافة السفلية للتيشيرت."
                    : "Measured vertically from the highest point of the shoulder down to the bottom hem."}
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-neutral-100">
                    {isAr ? "الكم (Sleeve):" : "Sleeve:"}
                  </strong>{" "}
                  {isAr
                    ? "طول الكم القصير من درزة الكتف حتى نهاية أساور الكم."
                    : "Short-sleeve length from the shoulder seam down to the sleeve cuff."}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Size Table (Adults or Children) */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="bg-slate-100/70 dark:bg-neutral-800/60 px-4 py-2.5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
                {sizeCategory === "adults" ? <Users size={14} /> : <Baby size={14} />}
                {sizeCategory === "adults"
                  ? isAr
                    ? "جدول مقاسات الكبار المعتمد"
                    : "Verified Adult Measurements"
                  : isAr
                  ? "جدول مقاسات الأطفال المعتمد"
                  : "Verified Children Measurements"}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                {isAr ? "قطن مصري أصلي ١٠٠٪" : "100% Egyptian Cotton"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 font-bold">
                    <th className="px-4 py-3 sm:px-6 text-start">
                      {isAr ? "المقاس (Size)" : "Size"}
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-center">
                      {isAr ? "العرض (سم)" : "Width (cm)"}
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-center">
                      {isAr ? "الطول (سم)" : "Length (cm)"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60 font-medium">
                  {currentSizes.map((row) => {
                    const isSelected = activeSize?.toUpperCase() === row.size;
                    return (
                      <tr
                        key={row.size}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-teal-50/70 text-teal-900 font-bold dark:bg-teal-950/40 dark:text-teal-200"
                            : "hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 text-slate-800 dark:text-neutral-200"
                        }`}
                      >
                        <td className="px-4 py-3 sm:px-6 text-start">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex min-w-[28px] h-7 px-2 items-center justify-center rounded-lg bg-slate-200/70 dark:bg-neutral-800 text-xs font-bold text-slate-800 dark:text-neutral-200">
                              {row.size}
                            </span>
                            <span>
                              {sizeCategory === "children"
                                ? isAr
                                  ? `مقاس ${row.size} (سن ${row.size} سنوات)`
                                  : `Size ${row.size} (Age ${row.size})`
                                : isAr
                                ? `مقاس ${row.size} (كبار)`
                                : `Size ${row.size} (Adult)`}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                <Check size={10} />
                                {isAr ? "المقاس المختار" : "Selected"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-center font-mono font-semibold">
                          {row.widthCm} {isAr ? "سم" : "cm"}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-center font-mono font-semibold">
                          {row.lengthCm} {isAr ? "سم" : "cm"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Measurement Recommendation Tip */}
          <div className="flex items-start gap-3 rounded-xl bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/50">
            <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isAr
                ? "نصيحة مهمة: للحصول على أفضل مقاس مناسب، يُفضل قياس تيشيرت قطني مريح لديك وهو مفرود تماماً على سطح مستوٍ ومقارنة عرضه وطوله بالجدول أعلاه."
                : "Helpful Tip: To ensure the best fit, measure a comfortable cotton T-shirt laid flat on a smooth surface and compare width and length with the table above."}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-neutral-800/80 dark:bg-neutral-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white cursor-pointer"
          >
            {isAr ? "حسناً، فهمت" : "Got it, Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
