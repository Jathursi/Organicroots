import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const sku = formData.get("sku") as string;
        const categoryId = formData.get("categoryId") as string;
        const brand = formData.get("brand") as string;
        const price = formData.get("price") as string;
        const stock = formData.get("stock") as string;
        const weight = formData.get("weight") as string;
        const status = formData.get("status") as string;
        const file = formData.get("file") as File | null;

        const data: Record<string, any> = {};

        if (name) data.name = name;
        if (sku) data.sku = sku;
        if (categoryId) data.categoryId = categoryId;
        if (brand !== null) data.brand = brand;
        if (price !== null) data.price = parseFloat(price) || 0;
        if (stock !== null) data.stock = parseInt(stock) || 0;
        if (weight !== null) data.weight = weight;
        if (status) data.status = status;

        if (file && file instanceof File && file.size > 0) {
            const folderPath = path.join(process.cwd(), "public", "upload", "products");
            await mkdir(folderPath, { recursive: true });

            const extension = path.extname(file.name) || ".jpg";
            const fileName = `${Date.now()}-${randomUUID()}${extension}`;
            const fullPath = path.join(folderPath, fileName);
            const bytes = Buffer.from(await file.arrayBuffer());

            await writeFile(fullPath, bytes);
            data.imageUrl = `/upload/products/${fileName}`;
        }

        const product = await prisma.product.update({
            where: { id },
            data,
        });

        return NextResponse.json({ product }, { status: 200 });
    } catch (error) {
        console.error(`[PUT /api/admin/products/${id}]`, error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Product deleted" }, { status: 200 });
    } catch (error) {
        console.error(`[DELETE /api/admin/products/${id}]`, error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
