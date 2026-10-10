import Link from "next/link";
export default function CollectionNotFound() { return <main className="catalog-page"><section className="catalog-empty"><h1>المجموعة غير موجودة</h1><p>قد يكون الرابط تغيّر أو لم تعد المجموعة منشورة.</p><Link href="/collections" className="daisy-button daisy-button--dark">العودة إلى المجموعات</Link></section></main>; }
