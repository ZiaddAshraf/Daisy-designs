import { permanentRedirect } from "next/navigation";

export default function LegacyKeychainsPage() {
  permanentRedirect("/categories/stickers/keychains");
}
