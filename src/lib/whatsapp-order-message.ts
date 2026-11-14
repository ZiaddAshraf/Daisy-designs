import { formatPrice } from "@/lib/products";
import { formatCustomizationEntries } from "@/lib/customization-formatter";
import type { Locale } from "@/lib/locale";

export type OrderConfirmationData = {
  number: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string | null;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string | null;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    email?: string;
    governorate?: string;
    city?: string;
    address?: string;
  } | null;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    customization?: Record<string, string>;
  }[];
};

export const DEFAULT_WHATSAPP_NUMBER = "201152606234";

/**
 * Returns the sanitized WhatsApp phone number configured for the store.
 */
export function getStoreWhatsAppNumber(): string {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "");
  return configured && configured.length >= 8 ? configured : DEFAULT_WHATSAPP_NUMBER;
}

/**
 * Strips any sensitive storage keys, private prefixes, internal filenames,
 * or URLs to ensure customer privacy and prevent security leakage.
 */
export function sanitizeCustomizationForWhatsApp(
  customization: Record<string, string> | undefined | null,
  locale: Locale
): string {
  if (!customization || Object.keys(customization).length === 0) return "";

  const customEntries = formatCustomizationEntries(customization, locale);
  const safeParts = customEntries
    .filter((entry) => {
      // Exclude internal filenames or keys
      if (entry.key === "custom_design_filename") return false;
      const val = entry.displayValue || "";
      if (
        val.includes("http://") ||
        val.includes("https://") ||
        val.includes("private:") ||
        val.includes("/uploads/") ||
        val.includes("tshirt_art_") ||
        val.includes("story_child_")
      ) {
        return false;
      }
      return true;
    })
    .map((entry) => `${entry.label}: ${entry.displayValue}`);

  return safeParts.join(" | ");
}

/**
 * Builds the comprehensive prefilled order message for WhatsApp.
 * Contains: Order reference, customer details, delivery address, notes,
 * products, quantities, sanitized customization, payment method, and final total.
 */
export function buildWhatsAppOrderMessage(
  confirmation: OrderConfirmationData,
  locale: Locale = "ar"
): string {
  const isAr = locale === "ar";
  const addr = confirmation.shippingAddress;
  const addressParts = [addr?.governorate, addr?.city, addr?.address].filter(Boolean);
  const addressStr = addressParts.join(" - ");

  if (isAr) {
    const lines: string[] = [
      `أهلاً متجر Daisy Designs! 🌸`,
      `أود تأكيد طلبي الجديد:`,
      ``,
      `📋 بيانات الطلب:`,
      `• رقم الطلب: ${confirmation.number}`,
      `• اسم العميل: ${addr?.fullName || "غير محدد"}`,
      `• رقم الهاتف: ${addr?.phone || "غير محدد"}`,
    ];

    if (addr?.email) {
      lines.push(`• البريد الإلكتروني: ${addr.email}`);
    }

    lines.push(`• عنوان التوصيل: ${addressStr || "غير محدد"}`);

    if (confirmation.notes) {
      lines.push(`• ملاحظات: ${confirmation.notes}`);
    }

    lines.push(`• طريقة الدفع: الدفع عند الاستلام (COD)`);
    lines.push(``);
    lines.push(`📦 تفاصيل المنتجات:`);

    confirmation.items.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.productName} (الكمية: ${item.quantity}) — ${formatPrice(item.unitPrice, "ar")} للقطعة`);
      const customizationText = sanitizeCustomizationForWhatsApp(item.customization, "ar");
      if (customizationText) {
        lines.push(`   └ التخصيص: ${customizationText}`);
      }
    });

    lines.push(``);
    if (confirmation.subtotal != null) lines.push(`المجموع الفرعي: ${formatPrice(confirmation.subtotal, "ar")}`);
    if (confirmation.discount != null) lines.push(`الخصم: ${formatPrice(confirmation.discount, "ar")}`);
    if (confirmation.couponCode) lines.push(`كود الخصم: ${confirmation.couponCode}`);
    if (confirmation.shipping != null) lines.push(`الشحن: ${formatPrice(confirmation.shipping, "ar")}`);
    lines.push(`💰 إجمالي الطلب: ${formatPrice(confirmation.total, "ar")}`);
    lines.push(``);
    lines.push(`أرجو تأكيد استلام الطلب وبدء التجهيز. شكراً لكم! ✨`);

    return lines.join("\n");
  } else {
    const lines: string[] = [
      `Hello Daisy Designs! 🌸`,
      `I'd like to confirm my new order:`,
      ``,
      `📋 Order Details:`,
      `• Order Number: ${confirmation.number}`,
      `• Customer Name: ${addr?.fullName || "N/A"}`,
      `• Phone Number: ${addr?.phone || "N/A"}`,
    ];

    if (addr?.email) {
      lines.push(`• Email: ${addr.email}`);
    }

    lines.push(`• Delivery Address: ${addressStr || "N/A"}`);

    if (confirmation.notes) {
      lines.push(`• Notes: ${confirmation.notes}`);
    }

    lines.push(`• Payment Method: Cash on Delivery (COD)`);
    lines.push(``);
    lines.push(`📦 Items:`);

    confirmation.items.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.productName} (Qty: ${item.quantity}) — ${formatPrice(item.unitPrice, "en")} each`);
      const customizationText = sanitizeCustomizationForWhatsApp(item.customization, "en");
      if (customizationText) {
        lines.push(`   └ Customization: ${customizationText}`);
      }
    });

    lines.push(``);
    if (confirmation.subtotal != null) lines.push(`Subtotal: ${formatPrice(confirmation.subtotal, "en")}`);
    if (confirmation.discount != null) lines.push(`Discount: ${formatPrice(confirmation.discount, "en")}`);
    if (confirmation.couponCode) lines.push(`Coupon: ${confirmation.couponCode}`);
    if (confirmation.shipping != null) lines.push(`Shipping: ${formatPrice(confirmation.shipping, "en")}`);
    lines.push(`💰 Total: ${formatPrice(confirmation.total, "en")}`);
    lines.push(``);
    lines.push(`Please confirm order receipt and processing. Thank you! ✨`);

    return lines.join("\n");
  }
}

/**
 * Builds the complete wa.me link with encoded text.
 */
export function getWhatsAppOrderUrl(
  confirmation: OrderConfirmationData,
  locale: Locale = "ar",
  customNumber?: string
): string {
  const phone = customNumber ? customNumber.replace(/[^0-9]/g, "") : getStoreWhatsAppNumber();
  const text = buildWhatsAppOrderMessage(confirmation, locale);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
