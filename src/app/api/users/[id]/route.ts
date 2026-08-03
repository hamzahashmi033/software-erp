import { db } from "@/lib/prisma";
import { isAuthenticated, hashPassword } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { password, roleId, isActive } = body as {
    password?: string;
    roleId?: string;
    isActive?: boolean;
  };

  if (password !== undefined && password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (roleId !== undefined) {
    const role = await db.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }
  }

  await db.user.update({
    where: { id },
    data: {
      ...(password !== undefined && { passwordHash: hashPassword(password) }),
      ...(roleId !== undefined && { roleId }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.user.delete({ where: { id } });
  return Response.json({ ok: true });
}
