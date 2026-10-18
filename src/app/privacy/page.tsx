import { ContentPage } from "@/components/content-page";
import { getRequestLocale } from "@/lib/locale-server";

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  return (
    <ContentPage
      eyebrow={isRtl ? "الخصوصية وحماية البيانات" : "Privacy & Data Protection"}
      title={
        isRtl
          ? "خصوصيتك وأمان بيانات أطفالك أولويتنا."
          : "Your privacy and family data protection are paramount."
      }
      intro={
        isRtl
          ? "نلتزم في Daisy Designs بحماية خصوصية كل أسرة وثقة كل ولي أمر يشاركنا تفاصيل طفله."
          : "At Daisy Designs, we are committed to safeguarding the privacy and trust of every family."
      }
    >
      <div className="space-y-4">
        <p>
          {isRtl
            ? "نستخدم بياناتك الشخصية (الاسم، العنوان، ورقم الهاتف) حصرياً لمعالجة طلبك وإتمام عملية الشحن والتوصيل، والتواصل معك بشأن حالة الشحنة."
            : "We use your contact details (name, delivery address, and phone number) exclusively to fulfill your orders, coordinate shipping, and notify you of order progress."}
        </p>
        <p>
          {isRtl
            ? "بيانات التخصيص (مثل أسماء الأطفال والصور المرفقة) تُستخدم لغرض الطباعة والتجهيز فقط، وتُحفظ بسرية وأمان تام دون مشاركتها أو استخدامها لأي غرض تسويقي دون إذن مسبق."
            : "Product personalization details (such as children's names and uploaded photos) are used solely for production and printing, kept strictly confidential, and never published or used for marketing without explicit consent."}
        </p>
        <p>
          {isRtl
            ? "لا نقوم ببيع أو تأجير بيانات العملاء لأي جهة خارجية. يتم تزويد مندوب شركة الشحن فقط بالاسم والعنوان ورقم الهاتف اللازم لإيصال الطلب."
            : "We never sell or distribute customer information to external third parties. Only essential delivery details are shared with verified courier partners to complete doorstep delivery."}
        </p>
      </div>
    </ContentPage>
  );
}
