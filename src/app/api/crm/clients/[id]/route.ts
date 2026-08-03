import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createClientSchema } from "@/lib/validations/crm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("clients.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const client = await db.client.findUnique({
    where: { id },
    include: {
      User: { select: { id: true, name: true } },
      ClientContact: { orderBy: { isPrimary: "desc" } },
      Invoice: { orderBy: { createdAt: "desc" }, take: 10 },
      Deal: { orderBy: { createdAt: "desc" }, take: 10 },
      Ticket: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ client });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("clients.edit");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const parsed = createClientSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const client = await db.client.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.legalName !== undefined && { legalName: data.legalName || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.industry !== undefined && { industry: data.industry || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.tags !== undefined && { tags: data.tags || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.address !== undefined && { address: data.address || null }),
      ...(data.accountManagerId !== undefined && { accountManagerId: data.accountManagerId || null }),
    },
  });

  return Response.json({ client });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("clients.delete");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await db.client.delete({ where: { id } });
  return Response.json({ ok: true });
}
