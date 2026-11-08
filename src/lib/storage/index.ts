import { LocalStorageBackend } from "./local-backend";
import { S3StorageBackend } from "./s3-backend";
import type { StorageBackend } from "./types";

export * from "./types";
export * from "./local-backend";
export * from "./s3-backend";

let defaultStorageBackend: StorageBackend | null = null;

export function getStorageBackend(): StorageBackend {
  if (defaultStorageBackend) return defaultStorageBackend;

  const driver = (process.env.PRIVATE_STORAGE_DRIVER ?? "local").toLowerCase().trim();
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

