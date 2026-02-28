import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, createAuthToken } from "@/lib/auth";
import { mapAuthServerError } from "@/lib/auth-error";

type RegisterBody = {
  email?: string;
  password?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();
    const fullName = body.fullName?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: fullName || null,
        profile: {
          create: {
            fullName: fullName || null,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    const token = await createAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json({ message: "Registration successful.", user }, { status: 201 });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("[auth/register]", error);
    const mapped = mapAuthServerError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
