import { TShirtPreview } from "@/components/tshirt-preview";
import { StickersPreview } from "@/components/stickers-preview";
import { StoryBookPreview } from "@/components/story-book-preview";
import { notFound } from "next/navigation";
export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { kind } = await searchParams;
  if (kind === "stickers") return <StickersPreview locale="ar" catalog={{ price: 300, stock: 10, variants: [{ id: "synthetic", name: "Test package", price: 300, stock: 10, options: {} }] }} />;
  if (kind === "story") return <StoryBookPreview locale="ar" inStock />;
  return <TShirtPreview locale="ar" price={450} inStock />;
}

