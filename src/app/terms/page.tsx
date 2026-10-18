import { ContentPage } from "@/components/content-page";
import { getRequestLocale } from "@/lib/locale-server";

export default async function TermsPage() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  return (
    <ContentPage
      eyebrow={isRtl ? "الشروط والأحكام" : "Terms & Conditions"}
      title={
        isRtl
          ? "تجربة تسوق واضحة وشفافة."
          : "A clear and transparent shopping experience."
      }
      intro={
        isRtl
          ? "باستخدام متجر Daisy Designs وتقديم طلبك، فإنك توافق على الشروط والأحكام المنظمة للخدمة والتخصيص."
          : "By shopping with Daisy Designs and placing an order, you agree to these service and personalization terms."
      }
    >
      <div className="space-y-4">
        <p>
          {isRtl
            ? "يتحمل العميل مسؤولية التأكد من دقة الاسم المكتوب، والمدرسة، والصف، والفصل، ورقم هاتف ولي الأمر قبل إتمام الطلب، حيث يتم تجهيز وطباعة المنتجات المخصصة فوراً وفق البيانات المدخلة."
            : "Customers are responsible for verifying the accuracy of child names, school, grade, section, and phone numbers before finalizing orders, as personalized printing is crafted directly from submitted specifications."}
        </p>
        <p>
          {isRtl
            ? "جميع الأسعار معلنة بالجنيه المصري (EGP) بوضوح تام. طريقة الدفع المعتمدة حالياً هي الدفع عند الاستلام (COD) نقداً لمندوب شركة الشحن."
            : "All catalog prices are transparently displayed in Egyptian Pounds (EGP). The approved payment method is Cash on Delivery (COD) paid directly to the courier."}
        </p>
        <p>
          {isRtl
            ? "قد يتواصل معك فريق Daisy Designs عبر الواتساب أو الهاتف لتأكيد أي تفاصيل تخص التخصيص أو المراجعة الطباعية قبل بدء الإنتاج لضمان خروج المنتج بأبهى صورة."
            : "The Daisy Designs team may reach out via WhatsApp or phone to confirm personalization details or artwork clarifications before production to guarantee exceptional print quality."}
        </p>
      </div>
    </ContentPage>
  );
}
