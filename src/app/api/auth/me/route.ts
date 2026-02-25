import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-session";

export async function GET() {
  const session = await getServerSession();

  if (!session || !session.sub) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: session.sub,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
      },
    },
    { status: 200 }
  );
}
