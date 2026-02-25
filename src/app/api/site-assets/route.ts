import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const assets = await prisma.siteAsset.findMany({
    select: {
      key: true,
      url: true,
      type: true,
    },
  });

  const mapped = assets.reduce<Record<string, { url: string; type: string }>>((acc, asset) => {
    acc[asset.key] = {
      url: asset.url,
      type: asset.type,
    };

    return acc;
  }, {});

  return NextResponse.json({ assets: mapped }, { status: 200 });
}
