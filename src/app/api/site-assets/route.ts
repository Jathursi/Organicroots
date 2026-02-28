import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assets = await prisma.siteAsset.findMany({
      select: {
        key: true,
        url: true,
        type: true,
      },
    });

    const mapped = assets.reduce((acc: Record<string, { url: string; type: string }>, asset: typeof assets[number]) => {
      acc[asset.key] = {
        url: asset.url,
        type: asset.type,
      };

      return acc;
    }, {} as Record<string, { url: string; type: string }>);

    return NextResponse.json({ assets: mapped }, { status: 200 });
  } catch (error) {
    console.error("[api/site-assets]", error);
    return NextResponse.json({ assets: {} }, { status: 200 });
  }
}
