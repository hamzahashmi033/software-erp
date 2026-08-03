import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createTicketSchema } from "@/lib/validations/crm";
import { buildTicketWhere } from "@/lib/crm-helpers";

export async function GET(request: Request) {
  const { allowed } = await resolveAccess("helpdesk.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;
  const where = buildTicketWhere(searchParams);

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        Client: { select: { id: true, name: true } },
        User_Ticket_assigneeIdToUser: { select: { id: true, name: true } },
      },
    }),
    db.ticket.count({ where }),
  ]);

  return Response.json({ tickets, total, page, limit });
}

export async function POST(request: Request) {
  const { allowed, session } = await resolveAccess("helpdesk.create");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const ticket = await db.ticket.create({
    data: {
      subject: data.subject,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority,
      status: data.status,
      clientId: data.clientId || null,
      assigneeId: data.assigneeId || null,
      createdById: session?.id ?? null,
    },
  });

  return Response.json({ ticket }, { status: 201 });
}
