import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    try {
        const {
            flashSale,
            categories,
            featuredProducts,
            weeklyProducts,
            collections,
            heroImages,
            siteAssetsArr,
        } = await prisma.$transaction(async (tx) => {
            const flashSale = await tx.flashSale.findFirst({
                where: { isActive: true, expiresAt: { gt: new Date() } },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    subtitle: true,
                    expiresAt: true,
                    products: {
                        take: 8,
                        select: {
                            price: true,
                            discount: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    weight: true,
                                    imageUrl: true,
                                    status: true,
                                    isFeatured: true,
                                    isWeeklySpecial: true,
                                    category: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            const categories = await tx.category.findMany({
                where: { isVisible: true },
                orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
                take: 12,
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    _count: { select: { products: true } },
                },
            });

            const featuredProductsRaw = await tx.product.findMany({
                where: { isFeatured: true, status: "active" },
                orderBy: { createdAt: "desc" },
                take: 12,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    weight: true,
                    imageUrl: true,
                    status: true,
                    isFeatured: true,
                    isWeeklySpecial: true,
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            const featuredProducts =
                featuredProductsRaw.length > 0
                    ? featuredProductsRaw
                    : await tx.product.findMany({
                        where: { status: "active" },
                        orderBy: { createdAt: "desc" },
                        take: 12,
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            weight: true,
                            imageUrl: true,
                            status: true,
                            isFeatured: true,
                            isWeeklySpecial: true,
                            category: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    });

            const weeklyProducts = await tx.product.findMany({
                where: { isWeeklySpecial: true, status: "active" },
                orderBy: { createdAt: "desc" },
                take: 12,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    weight: true,
                    imageUrl: true,
                    status: true,
                    isFeatured: true,
                    isWeeklySpecial: true,
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            const collections = await tx.collection.findMany({
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
                take: 8,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    imageUrl: true,
                    _count: { select: { products: true } },
                },
            });

            const heroImages = await tx.heroSliderImage.findMany({
                orderBy: { createdAt: "desc" },
                take: 8,
                select: { imageUrl: true },
            });

            const siteAssetsArr = await tx.siteAsset.findMany({
                select: { key: true, url: true },
            });

            return {
                flashSale,
                categories,
                featuredProducts,
                weeklyProducts,
                collections,
                heroImages,
                siteAssetsArr,
            };
        });

        interface HeroImage {
            imageUrl: string;
        }

        interface SiteAsset {
            key: string;
            url: string;
        }

        interface Category {
            id: string;
            name: string;
            imageUrl: string | null;
            _count: { products: number };
        }

        interface Product {
            id: string;
            name: string;
            price: number;
            weight: string | null;
            imageUrl: string | null;
            status: string;
            isFeatured: boolean;
            isWeeklySpecial: boolean;
            category?: { name: string } | null;
        }

        interface Collection {
            id: string;
            title: string;
            slug: string;
            imageUrl: string | null;
            _count: { products: number };
        }

        return NextResponse.json({
            flashSale,
            heroImages: heroImages.map((img: HeroImage) => img.imageUrl),
            siteAssets: siteAssetsArr.reduce((acc: Record<string, string>, asset: SiteAsset) => {
                acc[asset.key] = asset.url;
                return acc;
            }, {}),
            categories: categories.map((cat: Category) => ({
                id: cat.id,
                name: cat.name,
                count: `${cat._count.products} Selections`,
                image: cat.imageUrl || ""
            })),
            featuredProducts: featuredProducts.map((p: Product) => ({
                id: p.id,
                name: p.name,
                category: p.category?.name || "Uncategorized",
                price: `$${p.price.toFixed(2)}`,
                image: p.imageUrl || "",
                weight: p.weight || "1000gm",
                isFeatured: p.isFeatured,
                isWeeklySpecial: p.isWeeklySpecial,
                status: p.status
            })),
            weeklyProducts: weeklyProducts.map((p: Product) => ({
                id: p.id,
                name: p.name,
                category: p.category?.name || "Uncategorized",
                price: `$${p.price.toFixed(2)}`,
                image: p.imageUrl || "",
                weight: p.weight || "1000gm",
                isFeatured: p.isFeatured,
                isWeeklySpecial: p.isWeeklySpecial,
                status: p.status
            })),
            collections: collections.map((col: Collection) => ({
                id: col.id,
                title: col.title,
                slug: col.slug,
                imageUrl: col.imageUrl,
                count: col._count.products
            }))
        }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/home-content]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
