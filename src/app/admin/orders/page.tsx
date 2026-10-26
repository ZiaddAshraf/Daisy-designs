import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminOrdersTable, type AdminOrder, type ShippingAddressData } from "@/components/admin-orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const rawOrders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      address: true,
      items: {
        select: {
          id: true,
          productName: true,
          productSku: true,
          quantity: true,
          unitPrice: true,
          customization: true,
          selectedVariant: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const orders: AdminOrder[] = rawOrders.map((o) => ({
    id: o.id,
    number: o.number,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount,
    total: o.total,
    couponCode: o.couponCode,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    shippingAddress: (o.shippingAddress as unknown as ShippingAddressData | null) ?? null,
    user: o.user,
    address: o.address,
    items: o.items.map((it) => ({
      id: it.id,
      productName: it.productName,
      productSku: it.productSku,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      customization: (it.customization as Record<string, string>) || null,
      selectedVariant: it.selectedVariant,
    })),
  }));

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-12" dir="rtl">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[var(--muted-foreground)] uppercase">
            ADMIN / ORDERS MANAGEMENT
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            إدارة الطلبات والتخصيص
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted-foreground)]">
            مراجعة طلبات التيشيرت المطبوع، معاينة التصاميم المرفقة، والتواصل المباشر مع العملاء عبر واتساب قبل بدء الطباعة.
          </p>
        </div>
      </header>

      <AdminOrdersTable orders={orders} />
    </main>
  );
}
