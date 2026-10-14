"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type HeroTextRevealProps = {
  children: ReactNode;
  className?: string;
};

type SectionRevealProps = HeroTextRevealProps & {
  labelledBy: string;
};

export function HeroTextReveal({ children, className }: HeroTextRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}

export function SectionReveal({ children, className, labelledBy }: SectionRevealProps) {
  return (
    <section className={className} aria-labelledby={labelledBy} data-scroll-reveal suppressHydrationWarning>
      {children}
    </section>
  );
}

/**
 * Storybook-inspired section reveal for the Customized Stories section.
 * When reduced motion is preferred, renders a standard section immediately.
 */
export function StorybookReveal({ children, className, labelledBy }: SectionRevealProps) {
  return (
    <section className={className} aria-labelledby={labelledBy} data-scroll-reveal suppressHydrationWarning>
      {children}
    </section>
  );
}

/**
 * Gentle interactive floating/rotating mark for Daisy floral accents.
 * Marked aria-hidden="true" to keep decorative elements out of the accessibility tree.
 */
export function InteractiveMark({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <span className={className} aria-hidden="true">
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      aria-hidden="true"
      whileHover={{ scale: 1.15, rotate: 18 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Subtle staggered entrance for the 3 category cards on scroll.
 * When reduced motion is preferred, renders a standard div immediately.
 */
export function StaggerCategoryGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.09,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

