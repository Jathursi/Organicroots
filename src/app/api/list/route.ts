import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

type AddListItemBody = {
  name?: string;
  price?: string;
  image?: string;
  category?: string;
};

export async function GET() {
  const session = await getServerSession();

  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.userListItem.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as AddListItemBody;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }

  const item = await prisma.userListItem.create({
    data: {
      userId: session.sub,
      name,
      price: body.price?.trim() || null,
      image: body.image?.trim() || null,
      category: body.category?.trim() || null,
    },
  });

  return NextResponse.json({ message: "Added to list.", item }, { status: 201 });
}
