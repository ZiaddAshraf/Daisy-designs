import Image from "@/components/site-image";
import { getProductImageUrl } from "@/lib/product-image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-12 lg:px-16" dir="rtl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[.2em] text-neutral-400">ADMIN / CATALOG</p>
          <h1 className="mt-3 text-4xl font-semibold">المنتجات</h1>
        </div>
        <Link href="/admin/products/new" className="bg-neutral-950 px-5 py-3 text-sm text-white rounded">
          إضافة منتج
        </Link>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[820px] text-right text-sm">
          <thead>
            <tr className="border-b border-neutral-950">
              <th className="py-4">المنتج</th>
              <th>الصورة</th>
              <th>SKU</th>
              <th>القسم</th>
              <th>السعر</th>
              <th>المخزون</th>
              <th>النشر</th>
              <th>المميز</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-neutral-200">
                <td className="py-5 font-medium">{product.arabicName || product.name}</td>
                <td>
                  <div className="daisy-admin-product-preview relative h-14 w-14 bg-white">
                    <Image
                      src={getProductImageUrl(product.images[0]?.url)}
                      alt={product.name}
                      fill
                      sizes="56px"
                      className="daisy-admin-product-preview__image object-contain"
                    />
                  </div>
                </td>
                <td className="text-neutral-500">{product.sku}</td>
                <td>{product.category?.arabicName || product.category?.name}</td>
                <td>{product.price.toLocaleString("ar-EG")} ج.م</td>
                <td className={product.stock <= product.lowStockThreshold ? "text-red-600" : ""}>
                  {product.stock}
                </td>
                <td>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${
                      product.published
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-neutral-150 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {product.published ? "منشور" : "مسودة"}
                  </span>
                </td>
                <td>
                  {product.featured ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                      مميز ⭐
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">—</span>
                  )}
                </td>
                <td>
                  <Link href={`/admin/products/${product.id}`} className="underline text-sm font-medium">
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
