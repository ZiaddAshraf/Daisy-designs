import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB for high-resolution print photos
export const MIN_DIMENSION = 600; // Minimum 600px width and height for print viability
export const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const PRIVATE_STORAGE_DIR = path.join(
  process.cwd(),
  "storage",
  "private_uploads",
  "story_child_photos"
);

export type ImageDimensions = {
  width: number;
  height: number;
};

export type ValidatedImage = {
  extension: "jpg" | "png" | "webp";
  mimeType: string;
  dimensions: ImageDimensions;
  sanitizedBuffer: Buffer;
};

/**
 * Validates magic bytes to ensure file is genuinely a JPEG, PNG, or WebP.
 */
export function validateMagicBytes(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  // WebP: RIFF ... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

/**
 * Extracts image width & height from raw buffer.
 */
export function extractDimensions(buffer: Buffer, format: "jpg" | "png" | "webp"): ImageDimensions | null {
  try {
    if (format === "png" && buffer.length >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    if (format === "jpg") {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF markers (Baseline, Extended, Progressive, etc.)
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        if (marker === 0xda) break; // Start of Scan, stop
        if (marker === 0xd9) break; // EOI
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    if (format === "webp" && buffer.length >= 30) {
      // VP8 simple
      if (buffer.toString("ascii", 12, 16) === "VP8 ") {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      }
      // VP8L lossless
      if (buffer.toString("ascii", 12, 16) === "VP8L") {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width, height };
      }
      // VP8X extended
      if (buffer.toString("ascii", 12, 16) === "VP8X") {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return { width, height };
      }
    }
  } catch {
    // If dimensional parsing fails, return null
  }
  return null;
}

/**
 * Strips EXIF and geolocation metadata from JPEG/PNG images to safeguard child privacy.
 */
export function stripMetadata(buffer: Buffer, format: "jpg" | "png" | "webp"): Buffer {
  if (format === "jpg") {
    const chunks: Buffer[] = [buffer.subarray(0, 2)]; // Keep SOI (FF D8)
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      // End of Image
      if (marker === 0xd9) {
        chunks.push(buffer.subarray(offset));
        break;
      }
      // Start of Scan: remainder is compressed image data
      if (marker === 0xda) {
        chunks.push(buffer.subarray(offset));
        break;
      }
      const length = buffer.readUInt16BE(offset + 2);
      const nextOffset = offset + 2 + length;
      // Strip APP1 (0xE1: EXIF/XMP/GPS) and Comment (0xFE)
      if (marker !== 0xe1 && marker !== 0xfe) {
        chunks.push(buffer.subarray(offset, nextOffset));
      }
      offset = nextOffset;
    }
    return Buffer.concat(chunks);
  }

  if (format === "png") {
    // Keep 8-byte PNG signature
    const chunks: Buffer[] = [buffer.subarray(0, 8)];
    let offset = 8;
    while (offset < buffer.length - 12) {
      const chunkLength = buffer.readUInt32BE(offset);
      const chunkType = buffer.toString("ascii", offset + 4, offset + 8);
      const totalChunkSize = chunkLength + 12;
      // Strip non-critical metadata chunks: eXIf, tEXt, zTXt, iTXt
      if (chunkType !== "eXIf" && chunkType !== "tEXt" && chunkType !== "zTXt" && chunkType !== "iTXt") {
        chunks.push(buffer.subarray(offset, offset + totalChunkSize));
      }
      offset += totalChunkSize;
      if (chunkType === "IEND") break;
    }
    return Buffer.concat(chunks);
  }

  // WebP: default safe passthrough
  return buffer;
}

/**
 * Stores a validated, sanitized child photo into private non-public storage.
 * Returns the secure storage key (e.g. "private:story_child_<uuid>.jpg")
 */
export async function saveChildPhoto(buffer: Buffer, format: "jpg" | "png" | "webp"): Promise<{
  storageKey: string;
  filename: string;
  fullPath: string;
}> {
  await fs.mkdir(PRIVATE_STORAGE_DIR, { recursive: true });

  const filename = `story_child_${randomUUID()}.${format}`;
  const fullPath = path.join(PRIVATE_STORAGE_DIR, filename);

  const sanitized = stripMetadata(buffer, format);
  await fs.writeFile(fullPath, sanitized);

  const storageKey = `private:${filename}`;
  return { storageKey, filename, fullPath };
}

/**
 * Resolves a private storage key to its secure absolute filesystem path.
 */
export function resolveChildPhotoPath(storageKey: string): string | null {
  if (!storageKey.startsWith("private:story_child_")) return null;
  const filename = storageKey.replace("private:", "");
  // Sanitize filename against directory traversal
  const baseName = path.basename(filename);
  if (!baseName || baseName !== filename) return null;
  return path.join(PRIVATE_STORAGE_DIR, baseName);
}

/**
 * Deletes a child photo by storage key.
 */
export async function deleteChildPhoto(storageKey: string): Promise<boolean> {
  const filePath = resolveChildPhotoPath(storageKey);
  if (!filePath) return false;
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retention Maintenance: Purges orphaned uncompleted uploads older than maxAgeHours (default 24h).
 */
export async function purgeOrphanedPhotos(maxAgeHours = 24): Promise<number> {
  try {
    const entries = await fs.readdir(PRIVATE_STORAGE_DIR, { withFileTypes: true });
    const now = Date.now();
    const thresholdMs = maxAgeHours * 60 * 60 * 1000;
    let purgedCount = 0;

    for (const entry of entries) {
      if (entry.isFile() && entry.name.startsWith("story_child_")) {
        const filePath = path.join(PRIVATE_STORAGE_DIR, entry.name);
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > thresholdMs) {
          await fs.unlink(filePath);
          purgedCount++;
        }
      }
    }
    return purgedCount;
  } catch {
    return 0;
  }
}
