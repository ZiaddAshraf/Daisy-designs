import { LocalStorageBackend } from "./local-backend";
import { S3StorageBackend } from "./s3-backend";
import { DatabaseStorageBackend } from "./database-backend";
import { FallbackStorageBackend } from "./fallback-backend";
import type { StorageBackend } from "./types";

export * from "./types";
export * from "./local-backend";
export * from "./s3-backend";
export * from "./database-backend";
export * from "./fallback-backend";

let defaultStorageBackend: StorageBackend | null = null;

export function getStorageBackend(): StorageBackend {
  if (defaultStorageBackend) return defaultStorageBackend;

  const driver = (process.env.PRIVATE_STORAGE_DRIVER ?? "local").toLowerCase().trim();
  if (process.env.VERCEL) {
    const s3 = new S3StorageBackend();
    defaultStorageBackend = new FallbackStorageBackend(s3.isConfigured() ? s3 : null, new DatabaseStorageBackend());
    return defaultStorageBackend;
  }
  if (driver === "s3") {
    const s3 = new S3StorageBackend();
    if (s3.isConfigured()) {
      defaultStorageBackend = s3;
      return defaultStorageBackend;
    }
  }

  defaultStorageBackend = new LocalStorageBackend();
  return defaultStorageBackend;
}

export function setStorageBackendForTesting(backend: StorageBackend | null): void {
  defaultStorageBackend = backend;
}

