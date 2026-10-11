"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type HeroTextRevealProps = {
  children: ReactNode;
  className?: string;
};

type SectionRevealProps = HeroTextRevealProps & {
  labelledBy: string;
};

const revealEase = [0.22, 1, 0.36, 1] as const;

export function HeroTextReveal({ children, className }: HeroTextRevealProps) {
  const reduceMotion = useReducedMotion();

  return <motion.div
    className={className}
    data-motion-reveal
    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduceMotion ? 0 : 0.55, ease: revealEase }}
  >{children}</motion.div>;
}

export function SectionReveal({ children, className, labelledBy }: SectionRevealProps) {
  const reduceMotion = useReducedMotion();

  return <motion.section
    className={className}
    aria-labelledby={labelledBy}
    data-motion-reveal
    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.16 }}
    transition={{ duration: reduceMotion ? 0 : 0.5, ease: revealEase }}
  >{children}</motion.section>;
}
