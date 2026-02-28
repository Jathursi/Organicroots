import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");

        if (slug) {
            const collection = await prisma.collection.findUnique({
                where: { slug, isActive: true },
                include: {
                    products: {
                        include: {
                            product: {
                                include: { category: true }
                            }
                        }
                    }
                }
            });

            if (!collection) {
                return NextResponse.json({ error: "Collection not found" }, { status: 404 });
            }

            return NextResponse.json({ collection }, { status: 200 });
        }

        const collections = await prisma.collection.findMany({
            where: { isActive: true },
            include: {
                _count: { select: { products: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ collections }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/collections]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
