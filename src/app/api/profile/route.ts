import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

type UpdateProfileBody = {
  fullName?: string;
  avatarUrl?: string;
};

export async function GET() {
  const session = await getServerSession();

  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      profile: {
        select: {
          avatarUrl: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatarUrl: user.profile?.avatarUrl ?? null,
      },
    },
    { status: 200 }
  );
}

export async function PATCH(request: Request) {
  const session = await getServerSession();

  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdateProfileBody;
  const fullName = body.fullName?.trim() || null;
  const avatarUrl = body.avatarUrl?.trim() || null;

  const user = await prisma.user.update({
    where: { id: session.sub },
    data: {
      fullName,
      profile: {
        upsert: {
          create: {
            fullName,
            avatarUrl,
          },
          update: {
            fullName,
            avatarUrl,
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      profile: {
        select: {
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      message: "Profile updated.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatarUrl: user.profile?.avatarUrl ?? null,
      },
    },
    { status: 200 }
  );
}
