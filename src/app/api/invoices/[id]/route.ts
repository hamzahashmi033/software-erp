import { db } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      views: { orderBy: { viewedAt: "desc" } },
      _count: { select: { views: true, activeViewers: true } },
    },
  });

  if (!invoice) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ invoice });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.invoice.update({
    where: { id },
    data: { status: "VOID" },
  });

  return Response.json({ ok: true });
}
