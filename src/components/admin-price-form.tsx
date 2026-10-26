"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminPriceForm({
  product,
}: {
  product: {
    id: string;
    price: number;
    published?: boolean;
    featured?: boolean;
    variants: { id: string; name: string; price: number | null }[];
  };
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-5 max-w-xl"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");
        const form = new FormData(event.currentTarget);
        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: Number(form.get("price")),
            published: form.get("published") === "on",
            featured: form.get("featured") === "on",
            variants: product.variants.map((v) => ({
              id: v.id,
              price: form.get(v.id) === "" ? null : Number(form.get(v.id)),
            })),
          }),
        });
        setSaving(false);
        setMessage(response.ok ? "تم حفظ التعديلات بنجاح" : "تعذر حفظ التعديلات");
        if (response.ok) router.refresh();
      }}
    >
      <label className="block text-sm font-medium">
        السعر الأساسي (ج.م)
        <input
          className="block border border-neutral-300 rounded p-3 w-full mt-1"
          name="price"
          type="number"
          min="1"
          step="1"
          required
          defaultValue={product.price}
        />
      </label>

      {product.variants.map((v) => (
        <label key={v.id} className="block text-sm font-medium">
          {v.name} (ج.م)
          <input
            className="block border border-neutral-300 rounded p-3 w-full mt-1"
            name={v.id}
            type="number"
            min="1"
            step="1"
            defaultValue={v.price ?? ""}
            placeholder="السعر الأساسي"
          />
        </label>
      ))}

      <div className="space-y-3 pt-3 border-t border-neutral-200">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
          <input
            name="published"
            type="checkbox"
            defaultChecked={Boolean(product.published)}
            className="h-4 w-4 rounded"
          />
          <span>نشر المنتج (إتاحته للعملاء في المتجر)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={Boolean(product.featured)}
            className="h-4 w-4 rounded"
          />
          <span>منتج مميز (عرضه في قسم المنتجات المميزة بالصفحة الرئيسية)</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="daisy-button daisy-button--dark disabled:opacity-50"
      >
        {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>

      {message && (
        <p
          role="status"
          className={`text-sm ${message.includes("نجاح") ? "text-emerald-600" : "text-rose-600"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
