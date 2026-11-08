import { NextResponse } from "next/server";
import { ALLOWED_MIME_TYPES, extractDimensions, saveChildPhoto, validateMagicBytes } from "@/lib/child-photo-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") return NextResponse.json({ error: "NO_FILE_PROVIDED" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    if (!ALLOWED_MIME_TYPES.has(file.type)) return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = validateMagicBytes(buffer);
    if (!ext) return NextResponse.json({ error: "INVALID_FILE_MAGIC_BYTES" }, { status: 400 });
    const dimensions = extractDimensions(buffer, ext);
    if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    const { storageKey, filename } = await saveChildPhoto(buffer, ext);
    // Client preview uses its own blob URL. Only admins can retrieve this key.
    return NextResponse.json({ success: true, url: storageKey, key: storageKey, filename }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
