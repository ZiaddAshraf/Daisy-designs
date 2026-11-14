import type { PutObjectOptions, StorageBackend, StorageObject } from "./types";

export class FallbackStorageBackend implements StorageBackend {
  readonly driverName = "database";

  constructor(private readonly primary: StorageBackend | null, private readonly fallback: StorageBackend) {}

  async put(key: string, buffer: Buffer, options?: PutObjectOptions): Promise<{ key: string }> {
    if (this.primary) {
      try { return await this.primary.put(key, buffer, options); }
      catch (error) { console.error("[storage] primary put failed; using database", error instanceof Error ? error.message : "unknown"); }
    }
    return this.fallback.put(key, buffer, options);
  }

  async get(key: string): Promise<StorageObject | null> {
    if (this.primary) {
      try {
        const object = await this.primary.get(key);
        if (object) return object;
      } catch (error) { console.error("[storage] primary get failed; using database", error instanceof Error ? error.message : "unknown"); }
    }
    return this.fallback.get(key);
  }

  async delete(key: string): Promise<boolean> {
    let deleted = false;
    if (this.primary) {
      try { deleted = await this.primary.delete(key); }
      catch (error) { console.error("[storage] primary delete failed", error instanceof Error ? error.message : "unknown"); }
    }
    return (await this.fallback.delete(key)) || deleted;
  }

  async exists(key: string): Promise<boolean> {
    if (this.primary) {
      try { if (await this.primary.exists(key)) return true; }
      catch (error) { console.error("[storage] primary exists failed", error instanceof Error ? error.message : "unknown"); }
    }
    return this.fallback.exists(key);
  }
}
