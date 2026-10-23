import { ContentPage } from "@/components/content-page";
import { getRequestLocale } from "@/lib/locale-server";

export default async function ReturnsPage() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  return (
    <ContentPage
      eyebrow={isRtl ? "الاستبدال والاسترجاع" : "Returns & Exchanges"}
      title={isRtl ? "يهمنا جداً تكوني مبسوطة وفرحانة بطلبك." : "We want you to be completely delighted."}
      intro={
        isRtl
          ? "فرحة أطفالكم ورضاكم هو أهم حاجة عندنا في كل قطعة بنعملها بكل حب."
          : "Your family's happiness and satisfaction is our highest priority in every crafted piece."
      }
    >
      <div className="space-y-4">
        <p>
          {isRtl
            ? "لو وصلك أي منتج فيه عيب في الطباعة أو متضرر من الشحن، كلمينا فوراً على واتساب خلال ٤٨ ساعة مع صورة للمنتج، وهنعيد طباعته ونستبدله ليكي فوراً ومن غير أي مصاريف إضافية."
            : "If your item arrives damaged or with any printing defect caused by our team, please contact us within 48 hours of receipt with a photo. We will immediately reprint or replace it at no extra cost."}
        </p>
        <p>
          {isRtl
            ? "وعلشان منتجاتنا بتتعمل مخصوص بالاسم والصورة بناءً على طلبك، فالمنتجات السليمة المصنوعة بالطلب مش بينفع استبدالها أو إرجاعها إلا لو كان فيها عيب مصنعي."
            : "Because our personalized products are customized specifically with your child's name and details, customized items cannot be returned or exchanged unless there is a verifiable manufacturing defect."}
        </p>
      </div>
    </ContentPage>
  );
}
