"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/storefront";
import { directionForLocale } from "@/lib/locale";
import { MapPin, Phone, User, CheckCircle2 } from "lucide-react";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((response) => (response.ok ? response.json() : []))
      .then(setAddresses)
      .catch(() => undefined);
  }, []);

  return (
    <main dir={dir} className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="catalog-breadcrumb mb-6">
        <Link href="/">{isAr ? "الرئيسية" : "Home"}</Link>
        <span>/</span>
        <Link href="/account">{isAr ? "الحساب" : "Account"}</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] font-medium">{isAr ? "عناويني" : "My Addresses"}</span>
      </nav>

      <header className="mb-8" data-scroll-reveal suppressHydrationWarning>
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {isAr ? "العناوين" : "ADDRESSES"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {isAr ? "عناوين الشحن المحفوظة" : "Saved Shipping Addresses"}
        </h1>
      </header>

      {addresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2" data-scroll-reveal-stagger>
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                  <User size={16} className="text-teal-600 dark:text-teal-400" />
                  {address.fullName}
                </span>
                {address.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                    <CheckCircle2 size={12} />
                    {isAr ? "افتراضي" : "Default"}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-sm text-[var(--muted-foreground)]">
                <p className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0" />
                  <span dir="ltr">{address.phone}</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span>
                    {address.city} — {address.address}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-[var(--border)]">
            <MapPin size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
            {isAr ? "لا توجد عناوين محفوظة" : "No saved addresses"}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
            {isAr
              ? "يتم حفظ عناوين التوصيل تلقائياً أثناء إتمام طلباتك الأولى لتسهيل الشراء مستقبلاً."
              : "Shipping addresses will be automatically saved when you place an order for faster future checkout."}
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-6 py-3 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>{isAr ? "استعراض المنتجات" : "Browse Products"}</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
