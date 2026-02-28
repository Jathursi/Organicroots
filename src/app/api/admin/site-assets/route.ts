import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET() {
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const assets = await prisma.siteAsset.findMany();

        const mapped = assets.reduce((acc: Record<string, string>, asset: any) => {
            acc[asset.key] = asset.url;
            return acc;
        }, {});

        return NextResponse.json({ assets: mapped }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/site-assets]", error);
        return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
    }
}
