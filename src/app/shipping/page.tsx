import { ContentPage } from "@/components/content-page";
import { getRequestLocale } from "@/lib/locale-server";

export default async function ShippingPage() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  return (
    <ContentPage
      eyebrow={isRtl ? "الشحن والتوصيل" : "Shipping & Delivery"}
      title={isRtl ? "يوصل لباب بيتك بأمان." : "Delivered safely to your doorstep."}
      intro={
        isRtl
          ? "نشحن إلى جميع محافظات جمهورية مصر العربية بعناية ووضوح واهتمام بأدق التفاصيل."
          : "We ship nationwide across all Egyptian governorates with utmost care and attention."
      }
    >
      <div className="space-y-4">
        <p>
          {isRtl
            ? "القاهرة والجيزة: يستغرق التوصيل من يوم إلى ٣ أيام عمل بعد تجهيز التخصيص والطباعة."
            : "Cairo & Giza: Delivery takes 1 to 3 business days once personalization and printing are ready."}
        </p>
        <p>
          {isRtl
            ? "باقي المحافظات: يستغرق التوصيل من ٣ إلى ٦ أيام عمل عبر شركاء الشحن المعتمدين."
            : "All other governorates: Delivery takes 3 to 6 business days via trusted shipping carriers."}
        </p>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            {isRtl
              ? "رسوم الشحن ٦٠ ج.م لجميع المحافظات، والشحن مجاني بالكامل للطلبات التي تزيد قيمتها عن ٢٬٥٠٠ ج.م."
              : "Standard shipping fee is 60 EGP nationwide, and completely free on orders exceeding 2,500 EGP."}
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
