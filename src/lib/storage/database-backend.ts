import path from "node:path";
import type { PutObjectOptions, StorageBackend, StorageObject } from "./types";

function canonicalKey(key: string): string {
  const name = key.startsWith("private:") ? key.slice(8) : key;
  if (path.basename(name) !== name || !/^[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp|bin)$/i.test(name)) {
    throw new Error("INVALID_STORAGE_KEY");
  }
  return `private:${name}`;
}

export class DatabaseStorageBackend implements StorageBackend {
  readonly driverName = "database";

  async put(key: string, buffer: Buffer, options?: PutObjectOptions): Promise<{ key: string }> {
    const { prisma } = await import("@/lib/prisma");
    const canonical = canonicalKey(key);
    const data = Uint8Array.from(buffer);
    await prisma.privateUpload.upsert({
      where: { key: canonical },
      create: { key: canonical, data, contentType: options?.contentType ?? "application/octet-stream", metadata: options?.metadata },
      update: { data, contentType: options?.contentType ?? "application/octet-stream", metadata: options?.metadata },
    });
    return { key: canonical };
  }

  async get(key: string): Promise<StorageObject | null> {
    const { prisma } = await import("@/lib/prisma");
    let canonical: string;
    try { canonical = canonicalKey(key); } catch { return null; }
    const item = await prisma.privateUpload.findUnique({ where: { key: canonical } });
    if (!item) return null;
    return {
      data: Buffer.from(item.data),
      contentType: item.contentType,
      contentLength: item.data.length,
      metadata: item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
        ? Object.fromEntries(Object.entries(item.metadata).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
        : undefined,
    };
  }

  async delete(key: string): Promise<boolean> {
    const { prisma } = await import("@/lib/prisma");
    let canonical: string;
    try { canonical = canonicalKey(key); } catch { return false; }
    const result = await prisma.privateUpload.deleteMany({ where: { key: canonical } });
    return result.count > 0;
  }

  async exists(key: string): Promise<boolean> {
    const { prisma } = await import("@/lib/prisma");
    let canonical: string;
    try { canonical = canonicalKey(key); } catch { return false; }
    return Boolean(await prisma.privateUpload.findUnique({ where: { key: canonical }, select: { key: true } }));
  }
}
