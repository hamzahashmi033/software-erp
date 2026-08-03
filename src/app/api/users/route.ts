import { db } from "@/lib/prisma";
import { isAuthenticated, hashPassword } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      Role: { select: { id: true, name: true, slug: true } },
    },
  });
  return Response.json({ users });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, password, roleId } = body as {
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
  };

  if (!name || !email || !password || !roleId) {
    return Response.json({ error: "Name, email, password and role are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const role = await db.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: hashPassword(password), roleId },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      Role: { select: { id: true, name: true, slug: true } },
    },
  });

  return Response.json({ user }, { status: 201 });
}
