import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
    const session = await getServerSession();

    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const flashSales = await prisma.flashSale.findMany({
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                imageUrl: true,
                                category: { select: { name: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ flashSales }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/flash-sales]", error);
        return NextResponse.json({ error: "Failed to fetch flash sales" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        console.log("POST /api/admin/flash-sales - Prisma Model Keys:", Object.keys(prisma).filter(k => k[0] !== '_'));
        const { title, subtitle, expiresAt, isActive, products } = body;

        if (!title || !expiresAt || !products || !Array.isArray(products)) {
            return NextResponse.json({ error: "Title, expiry date, and products are required." }, { status: 400 });
        }

        const flashSale = await prisma.flashSale.create({
            data: {
                title,
                subtitle,
                expiresAt: new Date(expiresAt),
                isActive: isActive ?? true,
                products: {
                    create: products.map((p: any) => ({
                        productId: p.productId,
                        price: parseFloat(p.price),
                        discount: parseFloat(p.discount || 0)
                    }))
                }
            },
            include: {
                products: true
            }
        });

        return NextResponse.json({ message: "Flash sale created successfully", flashSale }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/admin/flash-sales]", error);
        return NextResponse.json({ error: "Failed to create flash sale" }, { status: 500 });
    }
}
