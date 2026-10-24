"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Download,
  Package,
  MapPin,
  Phone,
  User,
  Clock,
  ExternalLink,
  Shirt,
  Tag,
  AlertCircle,
} from "lucide-react";
import { AdminOrderStatus } from "@/components/admin-order-status";

export type ShippingAddressData = {
  fullName?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  address?: string;
  notes?: string | null;
};

export type AdminOrderItem = {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  customization?: Record<string, string> | null;
  selectedVariant?: unknown;
};

export type AdminOrder = {
  id: string;
  number: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  notes?: string | null;
  createdAt: string;
  shippingAddress?: ShippingAddressData | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;
  address?: {
    id: string;
    fullName: string;
    phone: string;
    governorate: string;
    city: string;
    address: string;
    notes?: string | null;
  } | null;
  items: AdminOrderItem[];
};

interface AdminOrdersTableProps {
  orders: AdminOrder[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  CONFIRMED: { label: "مؤكد", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300" },
  PROCESSING: { label: "قيد التجهيز", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300" },
  SHIPPED: { label: "تم الشحن", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300" },
  DELIVERED: { label: "تم التسليم", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  CANCELLED: { label: "ملغي", color: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300" },
};

function formatEgyptPhone(rawPhone?: string | null): string | null {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("20") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `2${digits}`;
  if (digits.length === 10) return `20${digits}`;
  return digits;
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = order.number.toLowerCase().includes(q);
        const matchesCustomer = (order.user?.name || "").toLowerCase().includes(q);
        const matchesAddressName = (order.address?.fullName || "").toLowerCase().includes(q);
        const matchesPhone =
          (order.address?.phone || "").includes(q) ||
          (order.user?.phone || "").includes(q) ||
          ((order.shippingAddress?.phone as string) || "").includes(q);
        return matchesNumber || matchesCustomer || matchesAddressName || matchesPhone;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pr-10 pl-4 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === "ALL"
                ? "bg-teal-600 text-white"
                : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            الكل ({orders.length})
          </button>
          {Object.entries(STATUS_LABELS).map(([key, info]) => {
            const count = orders.filter((o) => o.status === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === key
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {info.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center bg-[var(--card)]">
          <AlertCircle className="mx-auto text-[var(--muted-foreground)] mb-3" size={32} />
          <p className="text-base font-semibold text-[var(--foreground)]">لا توجد طلبات مطابقة</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">جرب تغيير معايير البحث أو اختيار حالة أخرى.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            const customerName =
              order.address?.fullName ||
              order.shippingAddress?.fullName ||
              order.user?.name ||
              "زائر متجر";
            const customerPhone =
              order.address?.phone ||
              order.shippingAddress?.phone ||
              order.user?.phone ||
              "";
            const formattedPhone = formatEgyptPhone(customerPhone);

            // Check if order contains T-shirt items
            const tshirtItems = order.items.filter(
              (it) =>
                it.productSku?.includes("TSHIRT") ||
                it.productName?.includes("تيشيرت") ||
                it.productName?.toLowerCase().includes("t-shirt") ||
                Boolean(it.customization?.garment_color || it.customization?.garment_size)
            );

            const hasCustomTshirt = tshirtItems.length > 0;

            // Generate WhatsApp message
            const whatsappText = encodeURIComponent(
              `مرحباً ${customerName}، معكم متجر Daisy Designs بخصوص طلبكم رقم ${order.number}` +
                (hasCustomTshirt ? " (تيشيرت أطفال مطبوع مخصص)" : "") +
                `. نود التواصل معكم لتأكيد تفاصيل الطلب والتصميم قبل بدء التجهيز.`
            );
            const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone}?text=${whatsappText}` : null;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm transition-all"
              >
                {/* Order Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)]/60">
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="p-1.5 rounded-lg bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mt-0.5 sm:mt-0"
                      aria-label={isExpanded ? "طي تفاصيل الطلب" : "عرض تفاصيل الطلب"}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-base text-[var(--foreground)]">
                          {order.number}
                        </span>
                        {hasCustomTshirt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 text-[11px] font-semibold border border-teal-200/60 dark:border-teal-800/60">
                            <Shirt size={12} />
                            تيشيرت مطبوع
                          </span>
                        )}
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                        <span className="inline-flex items-center gap-1">
                          <User size={13} className="text-neutral-400" />
                          <strong className="text-[var(--foreground)] font-medium">{customerName}</strong>
                        </span>
                        {customerPhone && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Phone size={13} className="text-neutral-400" />
                            {customerPhone}
                          </span>
                        )}
                        <span>
                          {order.items.length} {order.items.length === 1 ? "منتج" : "منتجات"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border)]/40">
                    <div className="text-left md:text-right">
                      <span className="block text-xs text-[var(--muted-foreground)]">المجموع الكلي</span>
                      <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                        {order.total.toLocaleString("ar-EG")} ج.م
                      </span>
                    </div>

                    {/* WhatsApp Action */}
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all"
                        title="تواصل مباشر عبر واتساب"
                      >
                        <MessageCircle size={15} />
                        <span>مراسلة واتساب</span>
                      </a>
                    )}

                    {/* Order Status Select */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-1">
                      <AdminOrderStatus id={order.id} value={order.status} />
                    </div>
                  </div>
                </div>

                {/* Collapsible Order Detail Section */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-[var(--surface-soft)]/50 space-y-6">
                    {/* Customer & Shipping Summary */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                          <User size={14} className="text-teal-600 dark:text-teal-400" />
                          بيانات العميل
                        </p>
                        <p className="text-sm font-bold text-[var(--foreground)]">{customerName}</p>
                        {customerPhone && <p className="text-xs text-[var(--muted-foreground)] font-mono">{customerPhone}</p>}
                        {order.user?.email && <p className="text-xs text-[var(--muted-foreground)]">{order.user.email}</p>}
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                          <MapPin size={14} className="text-teal-600 dark:text-teal-400" />
                          عنوان التوصيل
                        </p>
                        {order.address ? (
                          <div className="text-xs text-[var(--foreground)] space-y-0.5">
                            <p className="font-semibold">{order.address.governorate} - {order.address.city}</p>
                            <p>{order.address.address}</p>
                            {order.address.notes && <p className="text-[var(--muted-foreground)] mt-1">ملاحظات: {order.address.notes}</p>}
                          </div>
                        ) : order.shippingAddress ? (
                          <div className="text-xs text-[var(--foreground)] space-y-0.5">
                            <p className="font-semibold">
                              {order.shippingAddress.governorate} - {order.shippingAddress.city}
                            </p>
                            <p>{order.shippingAddress.address}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--muted-foreground)]">لا توجد تفاصيل شحن مسجلة</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                          <Tag size={14} className="text-teal-600 dark:text-teal-400" />
                          تفاصيل الدفع والتجهيز
                        </p>
                        <p className="text-xs text-[var(--foreground)]">
                          طريقة الدفع: <span className="font-semibold">{order.paymentMethod === "COD" ? "الدفع عند الاستلام" : order.paymentMethod}</span>
                        </p>
                        <p className="text-xs text-[var(--foreground)]">
                          المنتجات: {order.subtotal.toLocaleString("ar-EG")} ج.م | الشحن: {order.shipping.toLocaleString("ar-EG")} ج.م
                        </p>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
                          <Clock size={13} className="shrink-0" />
                          مدة التجهيز للمطبوعات: 2-3 أيام عمل قبل الشحن
                        </p>
                      </div>
                    </div>

                    {/* Order Items Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                        <Package size={16} className="text-teal-600 dark:text-teal-400" />
                        المنتجات والتخصيص المطلوب:
                      </h4>

                      <div className="space-y-3">
                        {order.items.map((item) => {
                          const cust = item.customization as Record<string, string> | null;
                          const hasTshirtArtwork =
                            cust?.custom_design_file &&
                            cust.custom_design_file.startsWith("private:tshirt_art_");
                          const isChildPhotoPending =
                            cust?.child_photo === "private:story_child_whatsapp_pending.jpg";
                          const hasChildPhoto =
                            !isChildPhotoPending &&
                            cust?.child_photo &&
                            (cust.child_photo.startsWith("private:child_photo_") ||
                              cust.child_photo.startsWith("private:story_child_"));

                          return (
                            <div
                              key={item.id}
                              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)]/50 pb-2.5">
                                <div>
                                  <span className="font-bold text-sm text-[var(--foreground)]">
                                    {item.productName}
                                  </span>
                                  <span className="text-xs text-[var(--muted-foreground)] mr-2 font-mono">
                                    ({item.productSku})
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-[var(--foreground)]">
                                  <span>{item.quantity} × {item.unitPrice.toLocaleString("ar-EG")} ج.م</span>
                                  <span className="mx-2 text-[var(--muted-foreground)]">=</span>
                                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                                    {(item.quantity * item.unitPrice).toLocaleString("ar-EG")} ج.م
                                  </span>
                                </div>
                              </div>

                              {/* Customization Details */}
                              {cust && Object.keys(cust).length > 0 && (
                                <div className="rounded-lg bg-[var(--surface-soft)] p-3 text-xs space-y-2 border border-[var(--border)]/60">
                                  <p className="font-bold text-[var(--foreground)] flex items-center gap-1 text-[11px] uppercase tracking-wide">
                                    <Tag size={13} className="text-teal-600 dark:text-teal-400" />
                                    مواصفات التخصيص للمنتج:
                                  </p>

                                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* T-Shirt Color */}
                                    {cust.garment_color && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[var(--muted-foreground)]">اللون:</span>
                                        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
                                          <span
                                            className="inline-block w-3 h-3 rounded-full border border-neutral-300 dark:border-neutral-600"
                                            style={{
                                              backgroundColor:
                                                cust.garment_color === "black"
                                                  ? "#1E1E1E"
                                                  : cust.garment_color === "gray"
                                                  ? "#9CA3AF"
                                                  : "#FFFFFF",
                                            }}
                                          />
                                          {cust.garment_color === "white"
                                            ? "أبيض (White)"
                                            : cust.garment_color === "black"
                                            ? "أسود (Black)"
                                            : "رمادي (Gray)"}
                                        </span>
                                      </div>
                                    )}

                                    {/* T-Shirt Size */}
                                    {cust.garment_size && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[var(--muted-foreground)]">المقاس:</span>
                                        <span className="font-bold text-[var(--foreground)] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded border border-teal-200/50 dark:border-teal-800/50">
                                          مقاس {cust.garment_size} {["S", "M", "L", "XL", "XXL"].includes(cust.garment_size.toUpperCase()) ? "(كبار)" : "(أطفال)"}
                                        </span>
                                      </div>
                                    )}

                                    {/* Print Placement */}
                                    {cust.print_placement && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[var(--muted-foreground)]">مكان الطباعة:</span>
                                        <span className="font-medium text-[var(--foreground)]">
                                          {cust.print_placement === "center_chest"
                                            ? "منتصف الصدر (Center Chest)"
                                            : cust.print_placement}
                                        </span>
                                      </div>
                                    )}

                                    {/* Child Name / Storybook info */}
                                    {cust.child_name && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[var(--muted-foreground)]">اسم الطفل:</span>
                                        <span className="font-bold text-[var(--foreground)]">{cust.child_name}</span>
                                      </div>
                                    )}

                                    {cust.school_name && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[var(--muted-foreground)]">المدرسة:</span>
                                        <span className="font-medium text-[var(--foreground)]">{cust.school_name}</span>
                                      </div>
                                    )}

                                    {cust.grade && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[var(--muted-foreground)]">الصف:</span>
                                        <span className="font-medium text-[var(--foreground)]">{cust.grade}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Written Custom Design Text */}
                                  {cust.custom_design_text && (
                                    <div className="mt-2 rounded-lg bg-[var(--card)] p-2.5 border border-[var(--border)]">
                                      <span className="font-bold text-[var(--foreground)] block mb-1">
                                        وصف فكرة التصميم من العميل:
                                      </span>
                                      <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                                        &ldquo;{cust.custom_design_text}&rdquo;
                                      </p>
                                    </div>
                                  )}

                                  {/* Downloadable / Viewable Files */}
                                  <div className="flex flex-wrap items-center gap-3 pt-2">
                                    {hasTshirtArtwork && (
                                      <a
                                        href={`/api/admin/orders/${order.id}/tshirt-artwork?key=${encodeURIComponent(cust.custom_design_file)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-3 py-1.5 text-xs font-semibold transition-all shadow-sm"
                                      >
                                        <Download size={14} />
                                        <span>معاينة / تحميل تصميم التيشيرت المرفوع</span>
                                        <ExternalLink size={12} className="opacity-80" />
                                      </a>
                                    )}

                                    {isChildPhotoPending && (
                                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 text-xs font-bold">
                                        <MessageCircle size={14} />
                                        <span>سيتم استلام صور الطفل عبر الواتساب</span>
                                      </span>
                                    )}

                                    {hasChildPhoto && (
                                      <a
                                        href={`/api/admin/orders/${order.id}/child-photo`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3 py-1.5 text-xs font-semibold transition-all shadow-sm"
                                      >
                                        <Download size={14} />
                                        <span>معاينة / تحميل صورة الطفل</span>
                                        <ExternalLink size={12} className="opacity-80" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

