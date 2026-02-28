import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET() {
    const session = await getServerSession();
    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const offers = await prisma.offer.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json({ offers }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/offers]", error);
        return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            title, type, isActive,
            triggerProductId, triggerQuantity,
            rewardProductId, rewardQuantity,
            discountValue, discountType,
            thresholdWeight, thresholdValue, savingsAmount,
            expiresAt
        } = body;

        if (!title || !type) {
            return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
        }

        const offer = await prisma.offer.create({
            data: {
                title,
                type,
                isActive: isActive ?? true,
                triggerProductId,
                triggerQuantity: triggerQuantity ? parseFloat(triggerQuantity) : null,
                rewardProductId,
                rewardQuantity: rewardQuantity ? parseFloat(rewardQuantity) : null,
                discountValue: discountValue ? parseFloat(discountValue) : null,
                discountType,
                thresholdWeight: thresholdWeight ? parseFloat(thresholdWeight) : null,
                thresholdValue: thresholdValue ? parseFloat(thresholdValue) : null,
                savingsAmount: savingsAmount ? parseFloat(savingsAmount) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            }
        });

        return NextResponse.json({ message: "Offer created successfully", offer }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/admin/offers]", error);
        return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
    }
}
