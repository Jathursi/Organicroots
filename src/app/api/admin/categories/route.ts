import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET() {
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const categories = await prisma.category.findMany({
            orderBy: { priority: "asc" },
        });

        return NextResponse.json({ categories }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/categories]", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const accentColor = formData.get("accentColor") as string;
        const priority = parseInt(formData.get("priority") as string) || 0;
        const isVisible = formData.get("isVisible") === "true";
        const file = formData.get("file") as File | null;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        let imageUrl = null;

        if (file && file instanceof File && file.size > 0) {
            const folderPath = path.join(process.cwd(), "public", "upload", "categories");
            await mkdir(folderPath, { recursive: true });

            const extension = path.extname(file.name) || ".png";
            const fileName = `${Date.now()}-${randomUUID()}${extension}`;
            const fullPath = path.join(folderPath, fileName);
            const bytes = Buffer.from(await file.arrayBuffer());

            await writeFile(fullPath, bytes);
            imageUrl = `/upload/categories/${fileName}`;
        }

        const category = await prisma.category.create({
            data: {
                name,
                accentColor: accentColor || undefined,
                priority,
                isVisible,
                imageUrl,
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/admin/categories]", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
