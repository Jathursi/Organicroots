import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const accentColor = formData.get("accentColor") as string;
        const priorityStr = formData.get("priority") as string;
        const isVisibleStr = formData.get("isVisible") as string;
        const file = formData.get("file") as File | null;

        const data: Record<string, any> = {};

        if (name) data.name = name;
        if (accentColor) data.accentColor = accentColor;
        if (priorityStr !== null) data.priority = parseInt(priorityStr) || 0;
        if (isVisibleStr !== null) data.isVisible = isVisibleStr === "true";

        if (file && file instanceof File && file.size > 0) {
            const folderPath = path.join(process.cwd(), "public", "upload", "categories");
            await mkdir(folderPath, { recursive: true });

            const extension = path.extname(file.name) || ".png";
            const fileName = `${Date.now()}-${randomUUID()}${extension}`;
            const fullPath = path.join(folderPath, fileName);
            const bytes = Buffer.from(await file.arrayBuffer());

            await writeFile(fullPath, bytes);
            data.imageUrl = `/upload/categories/${fileName}`;
        }

        const category = await prisma.category.update({
            where: { id },
            data,
        });

        return NextResponse.json({ category }, { status: 200 });
    } catch (error) {
        console.error(`[PUT /api/admin/categories/${id}]`, error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    try {
        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Category deleted" }, { status: 200 });
    } catch (error) {
        console.error(`[DELETE /api/admin/categories/${id}]`, error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
