import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { isAdmin } from "@/lib/admin-auth";
import { resolveChildPhotoPath } from "@/lib/child-photo-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Find any order item with child_photo customization
    let storageKey: string | null = null;
    for (const item of order.items) {
      if (item.customization && typeof item.customization === "object") {
        const cust = item.customization as Record<string, string>;
        if (cust.child_photo && cust.child_photo.startsWith("private:story_child_")) {
          storageKey = cust.child_photo;
          break;
        }
      }
    }

    if (!storageKey) {
      return NextResponse.json({ error: "لا توجد صورة طفل مرفقة بهذا الطلب" }, { status: 404 });
    }

    if (storageKey.includes("whatsapp_pending")) {
      return NextResponse.json(
        { message: "سيتم استلام صور الطفل عبر الواتساب من العميل / Child photos will be provided via WhatsApp", pendingWhatsApp: true },
        { status: 200 }
      );
    }

    const url = new URL(request.url);
    const photoIndex = parseInt(url.searchParams.get("index") || "0", 10);
    const filePath = resolveChildPhotoPath(storageKey, isNaN(photoIndex) ? 0 : photoIndex);
    if (!filePath) {
      return NextResponse.json({ error: "مسار الصورة غير صالح" }, { status: 400 });
    }

    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      try {
        const altDir = filePath.includes("daisy_storage")
          ? path.join(process.cwd(), "storage", "private_uploads", "story_child_photos")
          : path.join(os.tmpdir(), "daisy_storage", "private_uploads", "story_child_photos");
        buffer = await fs.readFile(path.join(altDir, path.basename(filePath)));
      } catch {
        return NextResponse.json({ error: "الملف غير موجود على الخادم أو تم حذفه وفق سياسة الاحتفاظ" }, { status: 404 });
      }
    }

    const ext = filePath.endsWith(".png") ? "png" : filePath.endsWith(".webp") ? "webp" : "jpeg";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": `image/${ext}`,
        "Content-Disposition": `inline; filename="order_${id}_child_photo.${ext}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SERVER_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

