export type ProductGalleryImage = { url: string; alt?: string | null };

export function getProductGalleryImage(images: ProductGalleryImage[], selectedIndex: number) {
    if (!images.length) return null;
    return images[selectedIndex] ?? images[0];
}
