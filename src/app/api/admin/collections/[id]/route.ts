import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const isActive = formData.get("isActive") === "true";
        const file = formData.get("file") as File | null;
        const productIds = formData.get("productIds") ? JSON.parse(formData.get("productIds") as string) : [];

        const data: Record<string, any> = {};
        if (title) data.title = title;
        if (slug) data.slug = slug;
        if (description !== null) data.description = description;
        data.isActive = isActive;

        if (file && file instanceof File && file.size > 0) {
            const folderPath = path.join(process.cwd(), "public", "upload", "collections");
            await mkdir(folderPath, { recursive: true });
            const extension = path.extname(file.name) || ".jpg";
            const fileName = `${Date.now()}-${randomUUID()}${extension}`;
            const fullPath = path.join(folderPath, fileName);
            const bytes = Buffer.from(await file.arrayBuffer());
            await writeFile(fullPath, bytes);
            data.imageUrl = `/upload/collections/${fileName}`;
        }

        const updatedCollection = await prisma.$transaction(async (tx: { collection: { update: (arg0: { where: { id: string; }; data: Record<string, any>; }) => any; }; collectionProduct: { deleteMany: (arg0: { where: { collectionId: string; }; }) => any; createMany: (arg0: { data: any; }) => any; }; }) => {
            const collection = await tx.collection.update({
                where: { id },
                data,
            });

            if (productIds) {
                // Delete existing collection products
                await tx.collectionProduct.deleteMany({
                    where: { collectionId: id }
                });

                // Create new ones
                await tx.collectionProduct.createMany({
                    data: productIds.map((pId: string) => ({
                        collectionId: id,
                        productId: pId
                    }))
                });
            }

            return collection;
        });

        return NextResponse.json({ collection: updatedCollection }, { status: 200 });
    } catch (error) {
        console.error("[PUT /api/admin/collections/[id]]", error);
        return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
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
        await prisma.collection.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Collection deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/admin/collections/[id]]", error);
        return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
    }
}
