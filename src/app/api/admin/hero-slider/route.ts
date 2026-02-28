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

  const images = await prisma.heroSliderImage.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      imageUrl: true,
    },
  });

  return NextResponse.json({ images: images.map((item: { imageUrl: string }) => item.imageUrl) }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.sub || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files were provided." }, { status: 400 });
  }

  const folderPath = path.join(process.cwd(), "public", "upload", "heroslider");
  await mkdir(folderPath, { recursive: true });

  const uploadedUrls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      continue;
    }

    const extension = path.extname(file.name) || ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const fullPath = path.join(folderPath, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());

    await writeFile(fullPath, bytes);

    const imageUrl = `/upload/heroslider/${fileName}`;

    await prisma.heroSliderImage.create({
      data: {
        imageUrl,
      },
    });

    uploadedUrls.push(imageUrl);
  }

  if (uploadedUrls.length === 0) {
    return NextResponse.json({ error: "No valid image files were uploaded." }, { status: 400 });
  }

  return NextResponse.json({ message: "Images uploaded.", images: uploadedUrls }, { status: 201 });
}
