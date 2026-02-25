import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const images = await prisma.heroSliderImage.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      imageUrl: true,
    },
  });

  return NextResponse.json({ images: images.map((item) => item.imageUrl) }, { status: 200 });
}
