import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRequestLocale } from "@/lib/locale-server";
import { directionForLocale } from "@/lib/locale";
import { Package, MapPin, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const locale = await getRequestLocale();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  return (
    <main dir={dir} className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-10" data-scroll-reveal suppressHydrationWarning>
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {isAr ? "لوحة الحساب" : "ACCOUNT DASHBOARD"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {isAr ? `مرحباً، ${session.user.name ?? "صديق ديزي"}` : `Welcome, ${session.user.name ?? "Daisy Friend"}`}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {isAr ? "إدارة طلباتك، عناويني المسجلة، وقائمة المفضلة بكل سهولة." : "Manage your orders, saved addresses, and wishlist effortlessly."}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3" data-scroll-reveal-stagger>
        <Link
          href="/account/orders"
          className="group flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
        >
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 mb-4 transition-transform group-hover:scale-105">
              <Package size={22} />
            </span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {isAr ? "طلباتي" : "My Orders"}
            </h2>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
              {isAr ? "متابعة سجل طلباتك وحالات الشحن والتسليم" : "View your order history, status, and tracking"}
            </p>
          </div>
          <span className="mt-6 inline-flex items-center text-xs font-semibold text-[var(--foreground)] group-hover:underline">
            {isAr ? "عرض الطلبات ←" : "View Orders →"}
          </span>
        </Link>

        <Link
          href="/account/addresses"
          className="group flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
        >
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 mb-4 transition-transform group-hover:scale-105">
              <MapPin size={22} />
            </span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {isAr ? "عناويني" : "My Addresses"}
            </h2>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
              {isAr ? "عناوين الشحن المحفوظة لتسريع عملية الطلب" : "Saved shipping destinations for faster checkout"}
            </p>
          </div>
          <span className="mt-6 inline-flex items-center text-xs font-semibold text-[var(--foreground)] group-hover:underline">
            {isAr ? "إدارة العناوين ←" : "Manage Addresses →"}
          </span>
        </Link>

        <Link
          href="/wishlist"
          className="group flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
        >
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 mb-4 transition-transform group-hover:scale-105">
              <Heart size={22} />
            </span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {isAr ? "قائمة المفضلة" : "Wishlist"}
            </h2>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
              {isAr ? "المنتجات والتصميمات التي قمت بحفظها" : "Products and designs you've saved for later"}
            </p>
          </div>
          <span className="mt-6 inline-flex items-center text-xs font-semibold text-[var(--foreground)] group-hover:underline">
            {isAr ? "استعراض المفضلة ←" : "Browse Wishlist →"}
          </span>
        </Link>
      </div>
    </main>
  );
}
