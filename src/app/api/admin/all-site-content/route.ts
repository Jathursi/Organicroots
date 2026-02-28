import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET() {
    const session = await getServerSession();
    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Run sequentially to minimize connection usage in low-pool environments
        const heroImages = await prisma.heroSliderImage.findMany({ orderBy: { createdAt: "desc" } });
        const siteAssetsArr = await prisma.siteAsset.findMany();

        const siteAssets = siteAssetsArr.reduce((acc: any, asset: any) => {
            acc[asset.key] = asset.url;
            return acc;
        }, {});

        return NextResponse.json({
            heroImages: heroImages.map((img: any) => img.imageUrl),
            siteAssets
        }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/all-site-content]", error);
        return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
    }
}
