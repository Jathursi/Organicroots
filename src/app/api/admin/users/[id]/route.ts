import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";
import bcrypt from "bcryptjs";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    const { id } = await params;

    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { fullName, email, role, password } = body;

        const data: any = {
            fullName,
            email: email?.toLowerCase(),
            role,
        };

        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data,
        });

        // Also update the profile name if provided
        if (fullName) {
            await prisma.profile.update({
                where: { userId: id },
                data: { fullName },
            });
        }

        return NextResponse.json({ message: "User updated successfully", user }, { status: 200 });
    } catch (error) {
        console.error("[PUT /api/admin/users/[id]]", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    const { id } = await params;

    if (!session?.sub || (session.role !== "admin" && session.role !== "super_admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/admin/users/[id]]", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
