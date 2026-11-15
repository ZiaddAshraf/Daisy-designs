import { EGYPTIAN_GOVERNORATES } from "@/lib/shipping";
import { ContentPage } from "@/components/content-page";
import { getRequestLocale } from "@/lib/locale-server";

export default async function ShippingPage() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  return (
    <ContentPage
      eyebrow={isRtl ? "الشحن والتوصيل" : "Shipping & Delivery"}
      title={isRtl ? "يوصلك لحد باب بيتك بأمان وسرعة." : "Delivered safely to your doorstep."}
    >
      <div className="space-y-4">
        <p>
          {isRtl
            ? "توصيل سريع لباب بيتك لجميع محافظات مصر مع مندوبين شحن موثوقين."
            : "Fast delivery to your doorstep across Egypt with trusted carriers."}
        </p>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4">
          <h2 className="font-semibold">{isRtl ? "تكلفة الشحن لكل طلب" : "Delivery fee per order"}</h2>
          <ul className="mt-3 space-y-2">
            {Array.from(new Set(EGYPTIAN_GOVERNORATES.map(region => region.fee))).filter(fee => fee !== null).sort((a, b) => a - b).map(fee => (
              <li key={fee}>
                <strong>{fee.toLocaleString(isRtl ? "ar-EG" : "en")} {isRtl ? "ج.م" : "EGP"}</strong>
                {" — "}{EGYPTIAN_GOVERNORATES.filter(region => region.fee === fee).map(region => isRtl ? region.nameAr : region.nameEn).join(isRtl ? "، " : ", ")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ContentPage>
  );
}
