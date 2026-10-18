import { ContentPage } from "@/components/content-page";
import { getRequestLocale } from "@/lib/locale-server";

export default async function ReturnsPage() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  return (
    <ContentPage
      eyebrow={isRtl ? "الاستبدال والاسترجاع" : "Returns & Exchanges"}
      title={isRtl ? "نريدك أن تكون راضيًا تماماً." : "We want you to be completely delighted."}
      intro={
        isRtl
          ? "رضا العائلة وأطفالكم هو أولويتنا القصوى في كل قطعة نصنعها."
          : "Your family's happiness and satisfaction is our highest priority in every crafted piece."
      }
    >
      <div className="space-y-4">
        <p>
          {isRtl
            ? "إذا وصل المنتج متضررًا أو به أي خطأ طباعي ناتج عن فريقنا، يرجى التواصل معنا خلال ٤٨ ساعة من الاستلام مع إرفاق صورة للمنتج وسنقوم فوراً بإعادة طباعته أو استبداله بدون أي تكلفة إضافية."
            : "If your item arrives damaged or with any printing defect caused by our team, please contact us within 48 hours of receipt with a photo. We will immediately reprint or replace it at no extra cost."}
        </p>
        <p>
          {isRtl
            ? "نظراً لأن منتجاتنا مخصصة ومطبوعة بالاسم والصورة بناءً على اختيارك، فإن المنتجات السليمة المصنوعة حسب الطلب لا يمكن استبدالها أو استرجاعها إلا في حال وجود عيب مصنعي."
            : "Because our personalized products are customized specifically with your child's name and details, customized items cannot be returned or exchanged unless there is a verifiable manufacturing defect."}
        </p>
      </div>
    </ContentPage>
  );
}
