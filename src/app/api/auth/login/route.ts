import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, createAuthToken } from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json({ error: "Unable to login right now." }, { status: 500 });
  }
}
