import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { isAdmin } from "@/lib/admin-auth";
import { resolveTshirtArtworkPath } from "@/lib/tshirt-artwork-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح / Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود / Order not found" }, { status: 404 });
    }

    // Collect all valid artwork keys associated with this order's line items
    const orderArtworkKeys = new Set<string>();
    for (const item of order.items) {
      if (item.customization && typeof item.customization === "object") {
        const cust = item.customization as Record<string, string>;
        if (
          typeof cust.custom_design_file === "string" &&
          cust.custom_design_file.startsWith("private:tshirt_art_")
        ) {
          orderArtworkKeys.add(cust.custom_design_file);
        }
      }
    }

    if (orderArtworkKeys.size === 0) {
      return NextResponse.json({ error: "لا يوجد ملف تصميم مرفق بهذا الطلب / No artwork attached" }, { status: 404 });
    }

    // Determine target artwork key
    let storageKey: string | null = null;
    const url = new URL(_request.url);
    const requestedKey = url.searchParams.get("key");

    if (requestedKey) {
      const normalizedKey = requestedKey.startsWith("private:") ? requestedKey : `private:${requestedKey}`;
      // Cross-order security check: key must belong to this specific order's items
      if (!orderArtworkKeys.has(normalizedKey)) {
        return NextResponse.json(
          { error: "ملف التصميم المطلوب غير مصرح به لهذا الطلب / Unauthorized artwork key for this order" },
          { status: 403 }
        );
      }
      storageKey = normalizedKey;
    } else {
      // Default to first artwork for single-shirt orders or legacy calls
      storageKey = Array.from(orderArtworkKeys)[0]!;
    }

    const filePath = resolveTshirtArtworkPath(storageKey);
    if (!filePath) {
      return NextResponse.json({ error: "مسار ملف التصميم غير صالح / Invalid artwork path" }, { status: 400 });
    }

    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      try {
        const altDir = filePath.includes("daisy_storage")
          ? path.join(process.cwd(), "storage", "private_uploads", "tshirt_artwork")
          : path.join(os.tmpdir(), "daisy_storage", "private_uploads", "tshirt_artwork");
        buffer = await fs.readFile(path.join(altDir, path.basename(filePath)));
      } catch {
        return NextResponse.json({ error: "الملف غير موجود على الخادم / Artwork file missing" }, { status: 404 });
      }
    }

    const ext = filePath.endsWith(".png") ? "png" : filePath.endsWith(".webp") ? "webp" : "jpeg";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": `image/${ext}`,
        "Content-Disposition": `inline; filename="order_${id}_tshirt_artwork.${ext}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to retrieve T-shirt artwork:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم / Internal error" }, { status: 500 });
  }
}

