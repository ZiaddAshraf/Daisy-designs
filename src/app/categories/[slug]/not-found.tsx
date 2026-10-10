import Link from "next/link";
export default function CategoryNotFound() { return <main className="catalog-page"><section className="catalog-empty"><h1>القسم غير موجود</h1><p>قد يكون الرابط تغيّر أو لم يعد القسم منشورًا.</p><Link href="/categories" className="daisy-button daisy-button--dark">العودة إلى الأقسام</Link></section></main>; }
