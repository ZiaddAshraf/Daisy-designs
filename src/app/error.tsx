/* eslint-disable react/no-unescaped-entities */
"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="mx-auto max-w-xl px-6 py-32 text-center"><h1 className="text-3xl font-semibold">حدث خطأ غ�Sر �.ت�^�,ع</h1><p className="mt-4 text-neutral-500">تعذر تح�.�S�" �?ذ�? ا�"صفحة. حا�^�" �.رة أخر�?.</p><button onClick={() => reset()} className="mt-8 bg-neutral-950 px-6 py-3 text-sm text-white">إعادة ا�"�.حا�^�"ة</button></main>; }
