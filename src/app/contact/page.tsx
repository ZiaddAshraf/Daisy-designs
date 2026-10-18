"use client";

import { useState } from "react";
import { useLocale, useTranslation } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { DaisyFlower } from "@/components/decorative-marks";

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslation();
  const isRtl = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setFeedbackMessage("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus("success");
        setFeedbackMessage(t("contactSuccess"));
        (event.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
        setFeedbackMessage(t("contactError"));
      }
    } catch {
      setStatus("error");
      setFeedbackMessage(t("contactError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      dir={directionForLocale(locale)}
      className="mx-auto max-w-[1180px] px-6 py-16 sm:py-24"
    >
      <header className="mb-12 max-w-2xl" data-scroll-reveal suppressHydrationWarning>
        <p className="text-xs font-semibold tracking-[.2em] text-[var(--muted-foreground)]">
          DAISY DESIGNS / {t("contactUs").toUpperCase()}
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {t("contactHeading")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
          {t("contactIntro")}
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
        {/* Contact Form */}
        <section
          className="lg:col-span-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 shadow-sm"
          aria-label={t("contactUs")}
          data-scroll-reveal
          suppressHydrationWarning
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-[var(--foreground)] mb-2"
                >
                  {t("contactName")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  required
                  minLength={2}
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
                  {t("contactEmail")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  required
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
                  {t("contactSubject")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  required
                  minLength={3}
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
                minLength={10}
                maxLength={1000}
                rows={5}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                placeholder={isRtl ? "اكتبي رسالتك بالتفصيل هنا..." : "Write your message details here..."}
              />
            </div>

            {status !== "idle" && (
              <div
                role="alert"
                aria-live="polite"
                className={`flex items-center gap-3 rounded-xl p-4 text-sm ${
                  status === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                {status === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{feedbackMessage}</span>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 dark:bg-white px-8 text-sm font-semibold text-white dark:text-neutral-950 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:cursor-wait disabled:opacity-50"
            >
              <Send size={16} />
              <span>{loading ? t("contactSending") : t("contactSendButton")}</span>
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
                  <span dir="ltr" className="block font-medium">
                    +20 10 1234 5678
                  </span>
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
