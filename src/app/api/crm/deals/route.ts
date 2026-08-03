import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createDealSchema } from "@/lib/validations/crm";
import { buildDealWhere } from "@/lib/crm-helpers";

export async function GET(request: Request) {
  const { allowed } = await resolveAccess("pipeline.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;
  const where = buildDealWhere(searchParams);

  const [deals, total] = await Promise.all([
    db.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        Client: { select: { id: true, name: true } },
        Lead: { select: { id: true, name: true } },
        User: { select: { id: true, name: true } },
      },
    }),
    db.deal.count({ where }),
  ]);

  return Response.json({ deals, total, page, limit });
}

export async function POST(request: Request) {
  const { allowed } = await resolveAccess("pipeline.create");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createDealSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const deal = await db.deal.create({
    data: {
      title: data.title,
      value: Math.round(data.value * 100),
      currency: data.currency,
      stage: data.stage,
      leadId: data.leadId || null,
      clientId: data.clientId || null,
      ownerId: data.ownerId || null,
      expectedClose: data.expectedClose ? new Date(data.expectedClose) : null,
      notes: data.notes || null,
    },
  });

  return Response.json({ deal }, { status: 201 });
}
