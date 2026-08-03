import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createDealSchema } from "@/lib/validations/crm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("pipeline.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      Client: { select: { id: true, name: true } },
      Lead: { select: { id: true, name: true } },
      User: { select: { id: true, name: true } },
    },
  });
  if (!deal) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ deal });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("pipeline.edit");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const parsed = createDealSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const deal = await db.deal.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.value !== undefined && { value: Math.round(data.value * 100) }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.stage !== undefined && { stage: data.stage }),
      ...(data.leadId !== undefined && { leadId: data.leadId || null }),
      ...(data.clientId !== undefined && { clientId: data.clientId || null }),
      ...(data.ownerId !== undefined && { ownerId: data.ownerId || null }),
      ...(data.expectedClose !== undefined && {
        expectedClose: data.expectedClose ? new Date(data.expectedClose) : null,
      }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });

  return Response.json({ deal });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("pipeline.delete");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await db.deal.delete({ where: { id } });
  return Response.json({ ok: true });
}
