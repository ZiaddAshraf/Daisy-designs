"use client";
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="mx-auto max-w-xl px-6 py-32 text-center" role="alert">
    <h1 className="text-3xl font-semibold">حدث خطأ غير متوقع</h1>
    <p className="mt-4 text-neutral-500">تعذر تحميل هذه الصفحة. حاولي مرة أخرى.</p>
    <button onClick={retry} className="mt-8 bg-neutral-950 px-6 py-3 text-sm text-white">إعادة المحاولة</button>
  </main>;
}
