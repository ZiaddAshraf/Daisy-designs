"use client";

import { getStoreWhatsAppNumber } from "@/lib/whatsapp-order-message";
import { useLocale, useTranslation } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { DaisyFlower } from "@/components/decorative-marks";

function InstagramIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslation();
  const isRtl = locale === "ar";
  const whatsappNumber = getStoreWhatsAppNumber();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const message = form.elements.namedItem("message") as HTMLTextAreaElement;
    if (!value("message")) {
      message.setCustomValidity(isRtl ? "اكتبي رسالتك." : "Enter your message.");
      message.reportValidity();
      return;
    }

    const text = [
      value("subject"),
      value("name") && `${t("contactName")}: ${value("name")}`,
      value("email") && `${t("contactEmail")}: ${value("email")}`,
      value("phone") && `${t("contactPhone")}: ${value("phone")}`,
    ].filter(Boolean).join("\n");
    const body = [text, value("message")].filter(Boolean).join("\n\n");
    window.location.assign(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(body)}`);
  }

  return (
    <main
      dir={directionForLocale(locale)}
      className="mx-auto max-w-[1180px] px-6 py-16 sm:py-24"
    >
      <header className="mb-12 max-w-2xl" data-scroll-reveal suppressHydrationWarning>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {t("contactUs")}
        </h1>
      </header>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
        {/* Contact Form */}
        <section
          className="lg:col-span-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 shadow-sm"
          aria-label={t("contactUs")}
          data-scroll-reveal
          suppressHydrationWarning
        >
          <form method="post" className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-[var(--foreground)] mb-2"
                >
                  {t("contactName")}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  maxLength={100}
                  autoComplete="name"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder={isRtl ? "مثال: ياسمين أحمد" : "e.g. Yasmin Ahmed"}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold text-[var(--foreground)] mb-2"
                >
                  {t("contactEmail")}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-semibold text-[var(--foreground)] mb-2"
                >
                  {t("contactPhone")}
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="010XXXXXXXX"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold text-[var(--foreground)] mb-2"
                >
                  {t("contactSubject")}
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  maxLength={120}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder={isRtl ? "استفسار عن طلب أو تخصيص" : "Inquiry about order or customization"}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-semibold text-[var(--foreground)] mb-2"
              >
                {t("contactMessage")} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                onInput={event => event.currentTarget.setCustomValidity("")}
                maxLength={1000}
                rows={5}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                placeholder={isRtl ? "اكتبي رسالتك بالتفصيل هنا..." : "Write your message details here..."}
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 dark:bg-white px-8 text-sm font-semibold text-white dark:text-neutral-950 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <Send size={16} />
              <span>{isRtl ? "فتح الرسالة في واتساب" : "Open message in WhatsApp"}</span>
            </button>
          </form>
        </section>

        {/* Informational Cards & Brand Details */}
        <aside className="lg:col-span-5 space-y-6" data-scroll-reveal suppressHydrationWarning>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                <DaisyFlower size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-[var(--foreground)]">Daisy Designs</h2>
                <span className="text-xs text-[var(--muted-foreground)]">Where Ideas Bloom</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 text-[var(--foreground)]">
                <Mail size={18} className="mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    {isRtl ? "البريد الإلكتروني" : "Email"}
                  </span>
                  <a href="mailto:hello@daisydesigns.shop" className="hover:underline">
                    hello@daisydesigns.shop
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[var(--foreground)]">
                <Phone size={18} className="mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    {isRtl ? "واتساب وخدمة العملاء" : "Customer Care & WhatsApp"}
                  </span>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="block font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                  >
                    +{whatsappNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[var(--foreground)]">
                <Clock size={18} className="mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    {isRtl ? "مواعيد الرد والتواصل" : "Support Hours"}
                  </span>
                  <span>{isRtl ? "يومياً من ٩ صباحاً حتى ٦ مساءً" : "Daily 9:00 AM – 6:00 PM (Cairo Time)"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[var(--foreground)]">
                <MapPin size={18} className="mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    {isRtl ? "بلد المنشأ والتصنيع" : "Craftsmanship & Origin"}
                  </span>
                  <span>{isRtl ? "صُنع وشُحن بكل حب في مصر 🇪🇬" : "Crafted & shipped with love in Egypt 🇪🇬"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-3">
                <a
                  href="https://www.instagram.com/daisydesign23"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
                >
                  <InstagramIcon size={14} className="text-pink-600" />
                  <span>@daisydesign23</span>
                </a>
                <a
                  href="https://www.facebook.com/share/1PwXqKfKAq/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
                >
                  <FacebookIcon size={14} className="text-blue-600" />
                  <span>{isRtl ? "صفحتنا على فيسبوك" : "Facebook Page"}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-2">
              {isRtl ? "شحن آمن ودفع عند الاستلام" : "Safe Delivery & COD"}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              {isRtl
                ? "نوفر خدمة الشحن لجميع محافظات جمهورية مصر العربية مع إمكانية الدفع عند الاستلام لضمان راحة بالك واطمئنانك."
                : "We provide nationwide delivery across all governorates of Egypt with Cash on Delivery (COD) for your peace of mind."}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
