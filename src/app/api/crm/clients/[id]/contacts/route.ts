import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createClientContactSchema } from "@/lib/validations/crm";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("clients.edit");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id: clientId } = await params;
  const body = await request.json();
  const parsed = createClientContactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const contact = await db.clientContact.create({
    data: {
      clientId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      title: data.title || null,
      isPrimary: data.isPrimary,
    },
  });

  return Response.json({ contact }, { status: 201 });
}
