import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
  className?: string;
};

/**
 * An elegant geometric 8-petal Daisy motif.
 * Designed with refined monoline strokes and a delicate center eye.
 */
export function DaisyFlower({ size = 24, className = "", ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`daisy-mark daisy-mark--flower ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* 8 Petals */}
      <path d="M12 2.5C12.8 5 12.8 7 12 8.5C11.2 7 11.2 5 12 2.5Z" />
      <path d="M12 21.5C12.8 19 12.8 17 12 15.5C11.2 17 11.2 19 12 21.5Z" />
      <path d="M2.5 12C5 12.8 7 12.8 8.5 12C7 11.2 5 11.2 2.5 12Z" />
      <path d="M21.5 12C19 12.8 17 12.8 15.5 12C17 11.2 19 11.2 21.5 12Z" />
      <path d="M5.28 5.28C7.4 6.8 8.8 8.2 8.5 9.5C7.2 9.2 5.8 7.8 5.28 5.28Z" />
      <path d="M18.72 18.72C16.6 17.2 15.2 15.8 15.5 14.5C16.8 14.8 18.2 16.2 18.72 18.72Z" />
      <path d="M18.72 5.28C17.2 7.4 15.8 8.8 14.5 8.5C14.8 7.2 16.2 5.8 18.72 5.28Z" />
      <path d="M5.28 18.72C6.8 16.6 8.2 15.2 8.5 14.5C7.2 14.8 5.8 16.2 5.28 18.72Z" />
      {/* Center circle */}
      <circle cx="12" cy="12" r="2.2" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    </svg>
  );
}

/**
 * A 4-point editorial sparkle / magic star.
 */
export function SparkleStar({ size = 16, className = "", ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`daisy-mark daisy-mark--sparkle ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path d="M8 0C8.3 3.8 8.7 5.8 10.5 7.5C12.2 9.3 14.2 9.7 16 10C14.2 10.3 12.2 10.7 10.5 12.5C8.7 14.2 8.3 16.2 8 16C7.7 16.2 7.3 14.2 5.5 12.5C3.8 10.7 1.8 10.3 0 10C1.8 9.7 3.8 9.3 5.5 7.5C7.3 5.8 7.7 3.8 8 0Z" />
    </svg>
  );
}

/**
 * A delightful hand-drawn underline wave / flourish.
 */
export function PlayfulWiggle({ className = "", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`daisy-mark daisy-mark--wiggle ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 7C14 2 24 11 36 6C48 1 58 11 70 6C82 1 92 11 104 6C110 3.5 115 5 118 7" />
    </svg>
  );
}

/**
 * A whimsical open storybook with tiny magical sparkles.
 */
export function StorybookIcon({ size = 28, className = "", ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`daisy-mark daisy-mark--book ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Book pages */}
      <path d="M14 7.5C11 5 6.5 5 3 6V21C6.5 20 11 20 14 22.5C17 20 21.5 20 25 21V6C21.5 5 17 5 14 7.5Z" />
      <path d="M14 7.5V22.5" />
      {/* Subtle bookmark ribbon */}
      <path d="M18 5V13L16 11.5L14 13V7.5" strokeWidth="1" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

/**
 * A delicate, restrained monoline daisy doodle (16px) for subtle title accents.
 */
export function TinyDaisyDoodle({ size = 16, className = "", ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`daisy-mark daisy-mark--doodle ${className}`}
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="1.5" fill="var(--accent-daisy)" stroke="none" />
      <path d="M8 2.5V4.5M8 11.5V13.5M2.5 8H4.5M11.5 8H13.5M4.1 4.1L5.5 5.5M10.5 10.5L11.9 11.9M11.9 4.1L10.5 5.5M5.5 10.5L4.1 11.9" />
    </svg>
  );
}


