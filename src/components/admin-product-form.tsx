"use client";

import { useRouter } from "next/navigation";

export function AdminProductForm({ categories }: { categories: { id: string; arabicName: string }[] }) {
  const router = useRouter();

  return (
    <form
      className="mx-auto max-w-3xl space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            arabicName: form.get("arabicName"),
            slug: form.get("slug"),
            description: form.get("description"),
            arabicDescription: form.get("arabicDescription"),
            price: Number(form.get("price")),
            sku: form.get("sku"),
            stock: Number(form.get("stock")),
            categoryId: form.get("categoryId"),
            tags: ["مخصص"],
            customizable: true,
            featured: form.get("featured") === "on",
            published: form.get("published") === "on",
            images: [{ url: form.get("image"), alt: form.get("arabicName") }],
            customizationFields: [{ label: "اسم الطفل", key: "name", type: "TEXT", required: true, options: [] }],
          }),
        });
        if (response.ok) router.push("/admin/products");
      }}
    >
      <input name="name" required placeholder="اسم المنتج بالإنجليزية" className="w-full border-b border-neutral-300 py-3" />
      <input name="arabicName" required placeholder="اسم المنتج بالعربية" className="w-full border-b border-neutral-300 py-3" />
      <input name="slug" required pattern="[a-z0-9-]+" placeholder="product-slug" className="w-full border-b border-neutral-300 py-3" />
      <textarea name="description" required minLength={10} placeholder="وصف المنتج" className="min-h-28 w-full border border-neutral-300 p-3" />
      <textarea name="arabicDescription" required minLength={10} placeholder="الوصف بالعربية" className="min-h-28 w-full border border-neutral-300 p-3" />
      <input name="price" required type="number" min="1" placeholder="السعر" className="w-full border-b border-neutral-300 py-3" />
      <input name="sku" required placeholder="SKU" className="w-full border-b border-neutral-300 py-3" />
      <input name="stock" required type="number" min="0" placeholder="المخزون" className="w-full border-b border-neutral-300 py-3" />
      <input name="image" required type="url" placeholder="رابط الصورة" className="w-full border-b border-neutral-300 py-3" />
      <select name="categoryId" required className="w-full border-b border-neutral-300 bg-white py-3">
        <option value="">اختر القسم</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.arabicName}
          </option>
        ))}
      </select>
      <div className="flex flex-col gap-2 pt-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input name="published" type="checkbox" className="h-4 w-4 rounded" />
          <span>نشر المنتج (إتاحته للعملاء في المتجر)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input name="featured" type="checkbox" className="h-4 w-4 rounded" />
          <span>منتج مميز (عرضه في قسم المنتجات المميزة بالصفحة الرئيسية)</span>
        </label>
      </div>
      <button className="w-full rounded-xl bg-neutral-950 dark:bg-white py-4 text-white dark:text-neutral-950 font-semibold hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer">
        حفظ المنتج
      </button>
    </form>
  );
}
