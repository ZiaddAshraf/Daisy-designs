import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { isAdmin } from "@/lib/admin-auth";
import { resolveChildPhotoPath } from "@/lib/child-photo-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
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

    const filePath = resolveChildPhotoPath(storageKey);
    if (!filePath) {
      return NextResponse.json({ error: "مسار الصورة غير صالح" }, { status: 400 });
    }

    try {
      const buffer = await fs.readFile(filePath);
      const ext = filePath.endsWith(".png") ? "png" : filePath.endsWith(".webp") ? "webp" : "jpeg";
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": `image/${ext}`,
          "Content-Disposition": `inline; filename="order_${id}_child_photo.${ext}"`,
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      });
    } catch {
      return NextResponse.json({ error: "الملف غير موجود على الخادم أو تم حذفه وفق سياسة الاحتفاظ" }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "SERVER_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

