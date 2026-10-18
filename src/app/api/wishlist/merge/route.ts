import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoCatalogProduct } from "@/lib/demo-preview-safety";
import { isDemoModeEnabled, shouldBlockDemoTransactions } from "@/lib/demo-mode";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const schema = z.object({ slugs: z.array(z.string()).max(200) });

export async function POST(request: Request) {
  if (shouldBlockDemoTransactions(isDemoModeEnabled())) {
    return NextResponse.json({ error: "DEMO_MODE_READ_ONLY" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات المفضلة غير صالحة" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async transaction => {
      const wishlist = await transaction.wishlist.upsert({
        where: { userId: session.user.id },
        update: {},
        create: { userId: session.user.id },
      });

      const products = await transaction.product.findMany({
        where: { slug: { in: parsed.data.slugs }, published: true },
        select: { id: true, slug: true, name: true, tags: true },
      });

      for (const product of products) {
        if (!isDemoCatalogProduct(product)) {
          await transaction.wishlistItem.upsert({
            where: { wishlistId_productId: { wishlistId: wishlist.id, productId: product.id } },
            update: {},
            create: { wishlistId: wishlist.id, productId: product.id },
          });
        }
      }

      return transaction.wishlistItem.findMany({
        where: { wishlistId: wishlist.id },
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
              category: true,
            },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "تعذر دمج قائمة المفضلة، يرجى المحاولة لاحقاً");
  }
}

