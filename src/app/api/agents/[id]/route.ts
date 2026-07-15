import { db } from "@/lib/prisma";
import { isAuthenticated, hashPassword } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.agent.delete({ where: { id } });
  return Response.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { password } = body as { password?: string };

  if (!password || password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  await db.agent.update({
    where: { id },
    data: { passwordHash: hashPassword(password) },
  });

  return Response.json({ ok: true });
}
