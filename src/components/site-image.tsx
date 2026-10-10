import NextImage, { type ImageProps } from "next/image";

export default function SiteImage(props: ImageProps) {
  return <NextImage {...props} src="/daisy-designs.png" alt="Daisy Designs" />;
}
