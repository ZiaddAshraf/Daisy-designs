import Link from "next/link";

export default function ProductNotFound() {
    return <main className="mx-auto max-w-xl px-6 py-32 text-center" dir="rtl">
        <h1 className="text-3xl font-semibold">المنتج غير موجود</h1>
        <p className="mt-4 text-neutral-500">ربما تغيّر الرابط أو لم يعد المنتج منشورًا في المتجر.</p>
        <Link href="/products" className="mt-8 inline-block bg-neutral-950 px-6 py-3 text-sm text-white">العودة إلى المتجر</Link>
    </main>;
}
