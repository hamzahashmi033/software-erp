import { db } from "@/lib/prisma";
import { getUserSession } from "@/lib/rbac";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const staff = await db.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return Response.json({ staff });
}
