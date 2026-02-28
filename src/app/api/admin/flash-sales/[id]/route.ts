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
        const { title, subtitle, expiresAt, isActive, products } = body;

        // Use a transaction to update the flash sale and its products
        const updatedFlashSale = await prisma.$transaction(async (tx: any) => {
            // Update the main flash sale details
            const flashSale = await tx.flashSale.update({
                where: { id },
                data: {
                    title,
                    subtitle,
                    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                    isActive,
                }
            });

            // If products are provided, sync them
            if (products && Array.isArray(products)) {
                // Delete existing flash sale products
                await tx.flashSaleProduct.deleteMany({
                    where: { flashSaleId: id }
                });

                // Create new ones
                await tx.flashSaleProduct.createMany({
                    data: products.map((p: any) => ({
                        flashSaleId: id,
                        productId: p.productId,
                        price: parseFloat(p.price),
                        discount: parseFloat(p.discount || 0)
                    }))
                });
            }

            return flashSale;
        });

        return NextResponse.json({ message: "Flash sale updated successfully", flashSale: updatedFlashSale }, { status: 200 });
    } catch (error) {
        console.error("[PUT /api/admin/flash-sales/[id]]", error);
        return NextResponse.json({ error: "Failed to update flash sale" }, { status: 500 });
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
        await prisma.flashSale.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Flash sale deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/admin/flash-sales/[id]]", error);
        return NextResponse.json({ error: "Failed to delete flash sale" }, { status: 500 });
    }
}
