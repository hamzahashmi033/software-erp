import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createLeadSchema } from "@/lib/validations/crm";
import { buildLeadWhere } from "@/lib/crm-helpers";

export async function GET(request: Request) {
  const { allowed } = await resolveAccess("leads.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;
  const where = buildLeadWhere(searchParams);

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        User: { select: { id: true, name: true } },
        _count: { select: { LeadActivity: true, Deal: true } },
      },
    }),
    db.lead.count({ where }),
  ]);

  return Response.json({ leads, total, page, limit });
}

export async function POST(request: Request) {
  const { allowed } = await resolveAccess("leads.create");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const lead = await db.lead.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      companyName: data.companyName || null,
      source: data.source,
      status: data.status,
      notes: data.notes || null,
      assigneeId: data.assigneeId || null,
    },
  });

  return Response.json({ lead }, { status: 201 });
}
