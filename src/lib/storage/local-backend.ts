import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { PutObjectOptions, StorageBackend, StorageObject } from "./types";

function resolveBaseDir(configuredDir?: string): string {
  if (configuredDir) return configuredDir;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "daisy_storage", "private_uploads");
  }
  return path.join(process.cwd(), "storage", "private_uploads");
}

function sanitizeKey(key: string): string {
  // Strip "private:" prefix if present for filesystem resolution
  const cleanKey = key.startsWith("private:") ? key.slice("private:".length) : key;
  // Prevent path traversal
  const baseName = path.basename(cleanKey);
  if (!baseName || baseName !== cleanKey) {
    throw new Error("INVALID_STORAGE_KEY_TRAVERSAL");
  }
  if (!/^[a-zA-Z0-9_\-.]+\.(jpg|jpeg|png|webp|bin)$/i.test(baseName)) {
    throw new Error("INVALID_STORAGE_KEY_CHARACTERS");
  }
  return baseName;
}

function inferContentType(filename: string, fallback?: string): string {
  if (fallback) return fallback;
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export class LocalStorageBackend implements StorageBackend {
  readonly driverName = "local" as const;
  private readonly baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = resolveBaseDir(customBaseDir);
  }

  private async ensureDir(): Promise<string> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      return this.baseDir;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err.code === "EROFS" || err.code === "EACCES")) {
        const fallback = path.join(os.tmpdir(), "daisy_storage", "private_uploads");
        await fs.mkdir(fallback, { recursive: true });
        return fallback;
      }
      throw err;
    }
  }

  private getFilePath(baseName: string): string {
    return path.join(this.baseDir, baseName);
  }

  async put(key: string, buffer: Buffer, options?: PutObjectOptions): Promise<{ key: string }> {
    const baseName = sanitizeKey(key);
    await this.ensureDir();
    const filePath = this.getFilePath(baseName);
    await fs.writeFile(filePath, buffer);

    if (options?.metadata) {
      const metaPath = `${filePath}.meta.json`;
      await fs.writeFile(metaPath, JSON.stringify({
        contentType: options.contentType ?? inferContentType(baseName),
        metadata: options.metadata,
      }), "utf8").catch(() => {});
    }

    const canonicalKey = key.startsWith("private:") ? key : `private:${baseName}`;
    return { key: canonicalKey };
  }

  async get(key: string): Promise<StorageObject | null> {
    let baseName: string;
    try {
      baseName = sanitizeKey(key);
    } catch {
      return null;
    }

    const filePath = this.getFilePath(baseName);
    try {
      const data = await fs.readFile(filePath);
      let contentType = inferContentType(baseName);
      let metadata: Record<string, string> | undefined;

      try {
        const metaRaw = await fs.readFile(`${filePath}.meta.json`, "utf8");
        const parsed = JSON.parse(metaRaw);
        if (parsed.contentType) contentType = parsed.contentType;
        if (parsed.metadata) metadata = parsed.metadata;
      } catch {
        // metadata file is optional
      }

      return {
        data,
        contentType,
        contentLength: data.length,
        metadata,
      };
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
        return null;
      }
      throw err;
    }
  }

  async delete(key: string): Promise<boolean> {
    let baseName: string;
    try {
      baseName = sanitizeKey(key);
    } catch {
      return false;
    }

    const filePath = this.getFilePath(baseName);
    try {
      await fs.unlink(filePath);
      await fs.unlink(`${filePath}.meta.json`).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    let baseName: string;
    try {
      baseName = sanitizeKey(key);
    } catch {
      return false;
    }

    const filePath = this.getFilePath(baseName);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

