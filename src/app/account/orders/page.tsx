import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/locale-server";
import { directionForLocale } from "@/lib/locale";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const locale = await getRequestLocale();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main dir={dir} className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="catalog-breadcrumb mb-6">
        <Link href="/">{isAr ? "الرئيسية" : "Home"}</Link>
        <span>/</span>
        <Link href="/account">{isAr ? "الحساب" : "Account"}</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] font-medium">{isAr ? "طلباتي" : "My Orders"}</span>
      </nav>

      <header className="mb-8" data-scroll-reveal suppressHydrationWarning>
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {isAr ? "الطلبات" : "ORDERS"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {isAr ? "سجل طلباتي" : "My Orders"}
        </h1>
      </header>

      {orders.length > 0 ? (
        <div className="space-y-4" data-scroll-reveal-stagger>
          {orders.map((order) => (
            <Link
              href={`/account/orders/${order.id}`}
              key={order.id}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--foreground)]/30 active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border)]">
                  <Package size={18} />
                </span>
                <div>
                  <span className="block font-mono text-sm font-bold text-[var(--foreground)]">
                    {order.number}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {order.createdAt.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] border border-[var(--border)]">
                  {order.status}
                </span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {formatPrice(order.total, locale)}
                </span>
                <span className="text-xs font-semibold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                  {isAr ? "تفاصيل الطلب ←" : "View Details →"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-[var(--border)]">
            <Package size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
            {isAr ? "لا توجد طلبات سابقة" : "No orders found"}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
            {isAr
              ? "لم تقم بإنشاء أي طلبات حتى الآن. استكشف منتجاتنا المميزة وابدأ طلبك الأول!"
              : "You haven't placed any orders yet. Explore our custom products to place your first order!"}
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
