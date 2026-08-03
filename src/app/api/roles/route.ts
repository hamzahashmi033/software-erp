import { db } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const roles = await db.role.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return Response.json({ roles });
}
