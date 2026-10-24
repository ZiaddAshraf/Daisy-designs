import { ContentPage } from "@/components/content-page";
import { getRequestLocale } from "@/lib/locale-server";

export default async function ShippingPage() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  return (
    <ContentPage
      eyebrow={isRtl ? "الشحن والتوصيل" : "Shipping & Delivery"}
      title={isRtl ? "يوصلك لحد باب بيتك بأمان وسرعة." : "Delivered safely to your doorstep."}
      intro={
        isRtl
          ? "بنشحن لكل محافظات مصر بكل حب واهتمام بأدق تفاصيل منتجات أطفالكم."
          : "We ship nationwide across all Egyptian governorates with utmost care and attention."
      }
    >
      <div className="space-y-4">
        <p>
          {isRtl
            ? "القاهرة والجيزة: التوصيل بياخد من يوم لـ ٣ أيام عمل بعد ما نجهز ونطبع المنتج المخصص."
            : "Cairo & Giza: Delivery takes 1 to 3 business days once personalization and printing are ready."}
        </p>
        <p>
          {isRtl
            ? "باقي محافظات مصر: التوصيل بياخد من ٣ لـ ٥ أيام عمل مع مندوبين شحن موثوقين."
            : "All other governorates: Delivery takes 3 to 6 business days via trusted shipping carriers."}
        </p>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            {isRtl
              ? "مصاريف الشحن ٦٠ ج.م بس لأي مكان في مصر، والشحن مجاني تماماً لأي أوردر يعدي ٧٠٠ ج.م 🚚"
              : "Standard shipping fee is 60 EGP nationwide, and completely free on orders exceeding 700 EGP."}
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
