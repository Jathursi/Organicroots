import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

const allowedKeys = {
  seedToPlateVideo: { folder: "seedtoplate", type: "video" },
  freeDeliveryImage: { folder: "free-delivery", type: "image" },
  dailyGrocerImage: { folder: "daily-grocer", type: "image" },
  handmadeProductsImage: { folder: "handmade-products", type: "image" },
} as const;

type AssetKey = keyof typeof allowedKeys;

function getAssetKey(key: string): AssetKey | null {
  return key in allowedKeys ? (key as AssetKey) : null;
}

export async function GET(_: Request, context: { params: Promise<{ key: string }> }) {
  const session = await getServerSession();

  if (!session?.sub || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key } = await context.params;
  const assetKey = getAssetKey(key);

  if (!assetKey) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const asset = await prisma.siteAsset.findUnique({
    where: { key: assetKey },
    select: {
      url: true,
      type: true,
    },
  });

  return NextResponse.json({ asset: asset ?? null }, { status: 200 });
}

export async function POST(request: Request, context: { params: Promise<{ key: string }> }) {
  const session = await getServerSession();

  if (!session?.sub || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key } = await context.params;
  const assetKey = getAssetKey(key);

  if (!assetKey) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const assetConfig = allowedKeys[assetKey];

  if (!file.type.startsWith(`${assetConfig.type}/`)) {
    return NextResponse.json({ error: `Expected ${assetConfig.type} file.` }, { status: 400 });
  }

  const folderPath = path.join(process.cwd(), "public", "upload", assetConfig.folder);
  await mkdir(folderPath, { recursive: true });

  const extension = path.extname(file.name) || (assetConfig.type === "video" ? ".mp4" : ".jpg");
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const fullPath = path.join(folderPath, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, bytes);

  const url = `/upload/${assetConfig.folder}/${fileName}`;

  const asset = await prisma.siteAsset.upsert({
    where: { key: assetKey },
    update: {
      url,
      type: assetConfig.type,
    },
    create: {
      key: assetKey,
      url,
      type: assetConfig.type,
    },
    select: {
      key: true,
      url: true,
      type: true,
    },
  });

  return NextResponse.json({ message: "Asset uploaded.", asset }, { status: 201 });
}
