import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createClientSchema } from "@/lib/validations/crm";
import { buildClientWhere } from "@/lib/crm-helpers";

export async function GET(request: Request) {
  const { allowed } = await resolveAccess("clients.view");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;
  const where = buildClientWhere(searchParams);

  const [clients, total] = await Promise.all([
    db.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        User: { select: { id: true, name: true } },
        _count: { select: { Invoice: true, Deal: true, Ticket: true, ClientContact: true } },
      },
    }),
    db.client.count({ where }),
  ]);

  return Response.json({ clients, total, page, limit });
}

export async function POST(request: Request) {
  const { allowed } = await resolveAccess("clients.create");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const client = await db.client.create({
    data: {
      name: data.name,
      legalName: data.legalName || null,
      email: data.email || null,
      phone: data.phone || null,
      industry: data.industry || null,
      status: data.status,
      tags: data.tags || null,
      notes: data.notes || null,
      website: data.website || null,
      address: data.address || null,
      accountManagerId: data.accountManagerId || null,
    },
  });

  return Response.json({ client }, { status: 201 });
}
