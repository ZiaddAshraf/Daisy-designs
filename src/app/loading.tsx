"use client";

import { useTranslation, useLocale } from "@/components/storefront";
import { BrandLogo } from "@/components/brand-logo";
import { DaisyFlower } from "@/components/decorative-marks";

export default function Loading() {
  const t = useTranslation();
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={t("loading")}
      className="daisy-loader-screen"
    >
      <div className="daisy-loader-container">
        {/* Subtle floral orbit ring */}
        <div className="daisy-loader-orbit" aria-hidden="true">
          <span className="daisy-loader-orbit-flower">
            <DaisyFlower size={18} />
          </span>
        </div>

        {/* Centerpiece official brand monogram lockup */}
        <div className="daisy-loader-center">
          <BrandLogo variant="lockup" priority />
        </div>

        {/* Hairline progress shimmer */}
        <div className="daisy-loader-progress-track" aria-hidden="true">
          <div className="daisy-loader-progress-bar" />
        </div>

        {/* Taglines */}
        <div className="daisy-loader-taglines">
          <span className="daisy-loader-tagline-en">WHERE IDEAS BLOOM</span>
          <span className="daisy-loader-tagline-ar">
            {isRtl ? "تفاصيل صغيرة، ذكريات كبيرة" : "Where ideas bloom for little ones"}
          </span>
        </div>
      </div>
    </main>
  );
}
