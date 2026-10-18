import { NextResponse } from "next/server";
import {
  ALLOWED_MIME_TYPES,
  extractDimensions,
  MAX_FILE_SIZE,
  MIN_DIMENSION,
  saveTshirtArtwork,
  validateMagicBytes,
} from "@/lib/tshirt-artwork-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "NO_FILE_PROVIDED", message: "لم يتم تقديم أي ملف" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: "حجم ملف التصميم يتجاوز الحد الأقصى (١٠ ميجابايت) / Artwork size exceeds 10MB limit",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "INVALID_FILE_TYPE",
          message: "يُسمح فقط بصور بصيغة JPEG أو PNG أو WebP / Only JPEG, PNG, or WebP images are permitted",
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
          message: "ملف غير صالح أو تالف / Corrupted or non-image file header",
        },
        { status: 400 }
      );
    }

    const dimensions = extractDimensions(buffer, ext);
    if (dimensions && (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION)) {
      return NextResponse.json(
        {
          error: "IMAGE_RESOLUTION_TOO_LOW",
          message: `دقة الصورة منخفضة جداً للطباعة (الحد الأدنى ${MIN_DIMENSION}×${MIN_DIMENSION} بكسل) / Minimum resolution for print viability is ${MIN_DIMENSION}x${MIN_DIMENSION}px`,
          dimensions,
        },
        { status: 400 }
      );
    }

    // Save into private non-public storage with EXIF/GPS metadata stripped
    const { storageKey, filename } = await saveTshirtArtwork(buffer, ext);

    return NextResponse.json({
      success: true,
      storageKey,
      filename,
      dimensions: dimensions ?? { width: 0, height: 0 },
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("T-shirt artwork upload error:", error);
    return NextResponse.json(
      { error: "INTERNAL_UPLOAD_ERROR", message: "حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}

