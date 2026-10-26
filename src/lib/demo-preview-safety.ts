export const DEMO_CATALOG_MARKER = "DEMO_CATALOG_V1";

export function isLocalDemoPreviewEnabled(nodeEnv: string | undefined, databaseUrl: string | undefined) {
  if (nodeEnv !== "development" || !databaseUrl) return false;
  try {
    const target = new URL(databaseUrl);
    const database = decodeURIComponent(target.pathname.slice(1));
    return (target.protocol === "postgres:" || target.protocol === "postgresql:") &&
      target.hostname === "127.0.0.1" && database === "stitch";
  } catch {
    return false;
  }
}

export function isDemoCatalogProduct(product: { slug: string; name: string; tags: string[] }) {
  return product.slug.startsWith("demo-") ||
    product.name.startsWith("DEMO — ") ||
    product.tags.includes(DEMO_CATALOG_MARKER);
}

export function isOrderableCatalogProduct(product: { slug: string; name: string; tags: string[]; published: boolean }) {
  return product.published && !isDemoCatalogProduct(product);
}
