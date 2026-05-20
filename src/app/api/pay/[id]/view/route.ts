import { db } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent") ?? null;

  // Deduplicate: skip if same IP + UA viewed within the last 60s
  const recentView = await db.invoiceView.findFirst({
    where: {
      invoiceId: id,
      ip: ip ?? undefined,
      userAgent: userAgent ?? undefined,
      viewedAt: { gte: new Date(Date.now() - 60_000) },
    },
  });

  if (!recentView) {
    await db.invoiceView.create({
      data: { invoiceId: id, ip, userAgent },
    });

    // Upgrade status from SENT → VIEWED (never downgrade from PAID/VOID)
    if (invoice.status === "SENT") {
      await db.invoice.update({
        where: { id },
        data: { status: "VIEWED" },
      });
    }
  }

  return Response.json({ ok: true });
}
