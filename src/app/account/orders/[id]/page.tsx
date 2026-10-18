import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/locale-server";
import { directionForLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/products";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const locale = await getRequestLocale();
  const isAr = locale === "ar";
  const dir = directionForLocale(locale);

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <main dir={dir} className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="catalog-breadcrumb mb-6">
        <Link href="/">{isAr ? "الرئيسية" : "Home"}</Link>
        <span>/</span>
        <Link href="/account">{isAr ? "الحساب" : "Account"}</Link>
        <span>/</span>
        <Link href="/account/orders">{isAr ? "طلباتي" : "My Orders"}</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] font-medium">{order.number}</span>
      </nav>

      <header className="mb-10" data-scroll-reveal suppressHydrationWarning>
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {isAr ? "تفاصيل الطلب" : "ORDER DETAILS"}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-[var(--foreground)]">
            {order.number}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
            {order.status}
          </span>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {order.createdAt.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12 items-start" data-scroll-reveal suppressHydrationWarning>
        {/* Order Items */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">
              {isAr ? "محتويات الطلب" : "Order Items"}
            </h2>
            <div className="divide-y divide-[var(--border)]">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {item.productName}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)] mt-0.5">
                        {isAr ? "الكمية:" : "Qty:"} {item.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {formatPrice(item.unitPrice * item.quantity, locale)}
                    </span>
                  </div>
                  {item.customization && (
                    <div className="mt-2 rounded-lg bg-[var(--surface-soft)] p-2.5 text-xs text-[var(--muted-foreground)] border border-[var(--border)]">
                      <span className="font-semibold text-[var(--foreground)]">
                        {isAr ? "التخصيص المطلوب:" : "Customization:"}
                      </span>{" "}
                      {typeof item.customization === "string"
                        ? item.customization
                        : JSON.stringify(item.customization)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Financial Summary */}
        <aside className="lg:col-span-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
            {isAr ? "ملخص الفاتورة" : "Payment Summary"}
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <span>{isAr ? "قيمة المنتجات" : "Items Subtotal"}</span>
              <span className="text-[var(--foreground)] font-medium">
                {formatPrice(order.subtotal, locale)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <span>{isAr ? "مصاريف الشحن" : "Shipping"}</span>
              <span className="text-[var(--foreground)] font-medium">
                {order.shipping === 0
                  ? isAr
                    ? "مجاني"
                    : "Free"
                  : formatPrice(order.shipping, locale)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--foreground)]">
              <span>{isAr ? "المجموع الكلي" : "Total Amount"}</span>
              <span className="text-teal-600 dark:text-teal-400">
                {formatPrice(order.total, locale)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400" />
              <span>{isAr ? "الدفع عند الاستلام (COD)" : "Cash on Delivery"}</span>
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
