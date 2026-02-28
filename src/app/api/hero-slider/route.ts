import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const images = await prisma.heroSliderImage.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        imageUrl: true,
      },
    });

    return NextResponse.json({ images: images.map((item: { imageUrl: string }) => item.imageUrl) }, { status: 200 });
  } catch (error) {
    console.error("[api/hero-slider]", error);
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}
