import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        const formatted = categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            count: `${cat._count.products} Selections`,
            image: cat.imageUrl || ""
        }));

        return NextResponse.json({ categories: formatted }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/categories]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
