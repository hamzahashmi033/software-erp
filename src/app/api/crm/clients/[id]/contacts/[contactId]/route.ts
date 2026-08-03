import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; contactId: string }> }) {
  const { allowed } = await resolveAccess("clients.edit");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { contactId } = await params;
  await db.clientContact.delete({ where: { id: contactId } });
  return Response.json({ ok: true });
}
