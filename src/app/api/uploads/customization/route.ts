import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { stripMetadata } from "@/lib/child-photo-storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getExtension(mimeType: string, buffer: Buffer): "jpg" | "png" | "webp" | null {
  // Check magic bytes
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
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
  if (
    buffer.length >= 12 &&
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "NO_FILE_PROVIDED" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = getExtension(file.type, buffer);
    if (!ext) {
      return NextResponse.json({ error: "INVALID_FILE_MAGIC_BYTES" }, { status: 400 });
    }

    let uploadDir = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
      ? path.join(os.tmpdir(), "daisy_storage", "uploads", "customizations")
      : path.join(process.cwd(), "public", "uploads", "customizations");

    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err.code === "EROFS" || err.code === "EACCES")) {
        uploadDir = path.join(os.tmpdir(), "daisy_storage", "uploads", "customizations");
        await fs.mkdir(uploadDir, { recursive: true });
      } else {
        throw err;
      }
    }

    const secureFilename = `stk_child_${randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, secureFilename);
    const sanitizedBuffer = stripMetadata(buffer, ext);
    await fs.writeFile(filePath, sanitizedBuffer);

    const publicUrl = `/uploads/customizations/${secureFilename}`;
    return NextResponse.json({ success: true, url: publicUrl, filename: secureFilename }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPLOAD_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

