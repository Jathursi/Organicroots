import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // featured, weekly

    try {
        const query: any = {
            where: { status: "active" },
            include: { category: true }
        };

        if (type === "featured") {
            query.where.isFeatured = true;
        } else if (type === "weekly") {
            query.where.isWeeklySpecial = true;
        }

        const products = await prisma.product.findMany(query);

        const formatted = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category?.name || "Uncategorized",
            price: `$${p.price.toFixed(2)}`,
            image: p.imageUrl || "",
            weight: p.weight || "1000gm"
        }));

        return NextResponse.json({ products: formatted }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/products]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
