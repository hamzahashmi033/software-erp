import { db } from "@/lib/prisma";
import { isAuthenticated, hashPassword, getAgentRoleId } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const agents = await db.user.findMany({
    where: { Role: { slug: "agent" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return Response.json({ agents });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, password } = body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const roleId = await getAgentRoleId();
  const agent = await db.user.create({
    data: { name, email, passwordHash: hashPassword(password), roleId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return Response.json({ agent }, { status: 201 });
}
