import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
    const session = await getServerSession();

    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            include: {
                profile: {
                    select: { avatarUrl: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/admin/users]", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { email, fullName, role, password } = body;

        if (!email || !role || !password) {
            return NextResponse.json({ error: "Email, role, and password are required." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                fullName,
                role,
                password: hashedPassword,
                profile: {
                    create: {
                        fullName,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "User created successfully.",
            user: { id: user.id, email: user.email, role: user.role }
        }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/admin/users]", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
