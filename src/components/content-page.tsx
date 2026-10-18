import type { ReactNode } from "react";
import { getRequestLocale } from "@/lib/locale-server";
import { directionForLocale } from "@/lib/locale";

export async function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const locale = await getRequestLocale();
  const dir = directionForLocale(locale);

  return (
    <main dir={dir} className="mx-auto max-w-[1000px] px-6 py-20 lg:px-0">
      <header data-scroll-reveal suppressHydrationWarning>
        <p className="text-xs font-semibold tracking-[.2em] text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--muted-foreground)]">
          {intro}
        </p>
      </header>
      <div
        data-scroll-reveal
        suppressHydrationWarning
        className="mt-12 max-w-3xl space-y-6 text-sm sm:text-base leading-relaxed text-[var(--foreground)] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 shadow-sm"
      >
        {children}
      </div>
    </main>
  );
}
