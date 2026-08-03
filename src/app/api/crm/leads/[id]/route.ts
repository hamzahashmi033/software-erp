import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createLeadSchema } from "@/lib/validations/crm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("leads.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      User: { select: { id: true, name: true } },
      LeadActivity: { orderBy: { createdAt: "desc" } },
      Deal: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!lead) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ lead });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("leads.edit");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const parsed = createLeadSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const lead = await db.lead.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.companyName !== undefined && { companyName: data.companyName || null }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId || null }),
    },
  });

  return Response.json({ lead });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("leads.delete");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await db.lead.delete({ where: { id } });
  return Response.json({ ok: true });
}
