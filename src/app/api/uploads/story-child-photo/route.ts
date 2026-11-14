import { NextResponse } from "next/server";
import {
  ALLOWED_MIME_TYPES,
  extractDimensions,
  MAX_FILE_SIZE,
  saveChildPhoto,
  validateMagicBytes,
} from "@/lib/child-photo-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "NO_FILE_PROVIDED" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: "Photo size exceeds 4MB limit / حجم الصورة يتجاوز الحد الأقصى (٤ ميجابايت)",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "INVALID_FILE_TYPE",
          message: "Only JPEG, PNG, or WebP images are permitted / يُسمح فقط بصور بصيغة JPEG أو PNG أو WebP",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = validateMagicBytes(buffer);
    if (!ext) {
      return NextResponse.json(
        {
          error: "INVALID_FILE_MAGIC_BYTES",
          message: "Corrupted or non-image file header / ملف غير صالح أو تالف",
        },
        { status: 400 }
      );
    }

    const dimensions = extractDimensions(buffer, ext);
    if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    }

    // Save into private non-public storage with EXIF/GPS metadata stripped
    const { storageKey, filename } = await saveChildPhoto(buffer, ext);

    return NextResponse.json(
      {
        success: true,
        key: storageKey,
        filename,
        dimensions: dimensions ?? { width: 0, height: 0 },
        message: "Photo uploaded to private storage / تم حفظ صورة الطفل في مساحة خاصة",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[story-child-photo] upload failed', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}

