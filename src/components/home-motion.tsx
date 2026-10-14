"use client";

import type { ReactNode } from "react";

type HeroTextRevealProps = {
  children: ReactNode;
  className?: string;
};

type SectionRevealProps = HeroTextRevealProps & {
  labelledBy: string;
};

export function HeroTextReveal({ children, className }: HeroTextRevealProps) {
  return <div className={className} data-scroll-reveal suppressHydrationWarning>{children}</div>;
}

export function SectionReveal({ children, className, labelledBy }: SectionRevealProps) {
  return <section className={className} aria-labelledby={labelledBy} data-scroll-reveal suppressHydrationWarning>{children}</section>;
}
