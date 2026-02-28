import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET() {
    const session = await getServerSession();
    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const collections = await prisma.collection.findMany({
            include: {
                _count: { select: { products: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json({ collections }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/collections]", error);
        return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const slug = (formData.get("slug") as string)?.toLowerCase() || title.toLowerCase().replace(/ /g, "-");
        const description = formData.get("description") as string;
        const isActive = formData.get("isActive") === "true";
        const file = formData.get("file") as File | null;
        const productIds = formData.get("productIds") ? JSON.parse(formData.get("productIds") as string) : [];

        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

        let imageUrl = null;
        if (file && file instanceof File && file.size > 0) {
            const folderPath = path.join(process.cwd(), "public", "upload", "collections");
            await mkdir(folderPath, { recursive: true });
            const extension = path.extname(file.name) || ".jpg";
            const fileName = `${Date.now()}-${randomUUID()}${extension}`;
            const fullPath = path.join(folderPath, fileName);
            const bytes = Buffer.from(await file.arrayBuffer());
            await writeFile(fullPath, bytes);
            imageUrl = `/upload/collections/${fileName}`;
        }

        const collection = await prisma.collection.create({
            data: {
                title,
                slug,
                description,
                imageUrl,
                isActive,
                products: {
                    create: productIds.map((id: string) => ({
                        product: { connect: { id } }
                    }))
                }
            }
        });

        return NextResponse.json({ collection }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/admin/collections]", error);
        return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
    }
}
