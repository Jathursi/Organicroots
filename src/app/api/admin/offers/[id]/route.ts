import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    const { id } = await params;

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

        const offer = await prisma.offer.update({
            where: { id },
            data: {
                title,
                type,
                isActive,
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

        return NextResponse.json({ message: "Offer updated successfully", offer }, { status: 200 });
    } catch (error) {
        console.error("[PUT /api/admin/offers/[id]]", error);
        return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    const { id } = await params;

    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await prisma.offer.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Offer deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/admin/offers/[id]]", error);
        return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
    }
}
