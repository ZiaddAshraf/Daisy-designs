import Image from "@/components/site-image";
import Link from "next/link";

export interface BrandLogoProps {
  variant?: "full" | "lockup" | "monogram";
  className?: string;
  priority?: boolean;
  asLink?: boolean;
  altText?: string;
}

export function BrandLogo({
  variant = "lockup",
  className = "",
  priority = false,
  asLink = false,
  altText = "Daisy Designs | Where Ideas Bloom",
}: BrandLogoProps) {
  let lightSrc = "/brand/daisy-designs-lockup-dark.png";
  let darkSrc = "/brand/daisy-designs-lockup-light.png";
  let width = 190;
  let height = 118;

  if (variant === "full") {
    lightSrc = "/brand/daisy-designs-logo-dark.png";
    darkSrc = "/brand/daisy-designs-logo-light.png";
    width = 240;
    height = 180;
  } else if (variant === "monogram") {
    lightSrc = "/brand/daisy-designs-monogram-square-dark.png";
    darkSrc = "/brand/daisy-designs-monogram-square-light.png";
    width = 100;
    height = 100;
  }

  const content = (
    <span className={`daisy-brand-logo daisy-brand-logo--${variant} ${className}`}>
      <Image
        src={lightSrc}
        alt={altText}
        width={width}
        height={height}
        priority={priority}
        className="daisy-brand-logo__img daisy-brand-logo__img--light"
      />
      <Image
        src={darkSrc}
        alt={altText}
        width={width}
        height={height}
        priority={priority}
        className="daisy-brand-logo__img daisy-brand-logo__img--dark"
      />
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="daisy-brand-link" aria-label={altText}>
        {content}
      </Link>
    );
  }

  return content;
}

