import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const flashSale = await prisma.flashSale.findFirst({
            where: {
                isActive: true,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                products: {
                    include: {
                        product: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ flashSale }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/flash-sale]", error);
        return NextResponse.json({ error: "Failed to fetch flash sale" }, { status: 500 });
    }
}
