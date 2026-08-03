import { db } from "@/lib/prisma";
import { resolveAccess } from "@/lib/rbac";
import { createLeadActivitySchema } from "@/lib/validations/crm";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await resolveAccess("leads.edit");
  if (!allowed) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id: leadId } = await params;
  const body = await request.json();
  const parsed = createLeadActivitySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const activity = await db.leadActivity.create({
    data: { leadId, type: data.type, note: data.note },
  });

  return Response.json({ activity }, { status: 201 });
}
