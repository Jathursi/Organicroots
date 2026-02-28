import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
    const session = await getServerSession();

    if (!session?.sub || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const stockStatus = searchParams.get("stockStatus"); // in-stock, low-stock, out-of-stock
        const search = searchParams.get("search");

        const where: any = {};

        if (categoryId && categoryId !== "all") {
            where.categoryId = categoryId;
        }

        if (stockStatus) {
            if (stockStatus === "in-stock") where.stock = { gt: 10 };
            if (stockStatus === "low-stock") where.stock = { lte: 10, gt: 0 };
            if (stockStatus === "out-of-stock") where.stock = 0;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/products]", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
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
        const sku = formData.get("sku") as string;
        const categoryId = formData.get("categoryId") as string;
        const brand = formData.get("brand") as string;
        const price = parseFloat(formData.get("price") as string) || 0;
        const stock = parseInt(formData.get("stock") as string) || 0;
        const weight = formData.get("weight") as string;
        const status = formData.get("status") as string || "active";
        const file = formData.get("file") as File | null;

        if (!name || !sku || !categoryId) {
            return NextResponse.json({ error: "Name, SKU, and Category are required." }, { status: 400 });
        }

        // Check if SKU exists
        const existing = await prisma.product.findUnique({ where: { sku } });
        if (existing) {
            return NextResponse.json({ error: "SKU already exists." }, { status: 409 });
        }

        let imageUrl = null;

        if (file && file instanceof File && file.size > 0) {
            const folderPath = path.join(process.cwd(), "public", "upload", "products");
            await mkdir(folderPath, { recursive: true });

            const extension = path.extname(file.name) || ".jpg";
            const fileName = `${Date.now()}-${randomUUID()}${extension}`;
            const fullPath = path.join(folderPath, fileName);
            const bytes = Buffer.from(await file.arrayBuffer());

            await writeFile(fullPath, bytes);
            imageUrl = `/upload/products/${fileName}`;
        }

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                categoryId,
                brand: brand || null,
                price,
                stock,
                weight: weight || null,
                imageUrl,
                status,
                isFeatured: formData.get("isFeatured") === "true",
                isWeeklySpecial: formData.get("isWeeklySpecial") === "true",
            },
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/admin/products]", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
