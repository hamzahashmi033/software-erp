import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createTicketSchema } from "@/lib/validations/crm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("helpdesk.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      Client: { select: { id: true, name: true } },
      User_Ticket_assigneeIdToUser: { select: { id: true, name: true } },
      User_Ticket_createdByIdToUser: { select: { id: true, name: true } },
    },
  });
  if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ticket });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("helpdesk.edit");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const parsed = createTicketSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const ticket = await db.ticket.update({
    where: { id },
    data: {
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.category !== undefined && { category: data.category || null }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.clientId !== undefined && { clientId: data.clientId || null }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId || null }),
    },
  });

  return Response.json({ ticket });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("helpdesk.delete");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await db.ticket.delete({ where: { id } });
  return Response.json({ ok: true });
}
