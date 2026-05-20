import { db } from "@/lib/prisma";

const ACTIVE_WINDOW_MS = 30_000; // 30 seconds

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { sessionId } = body as { sessionId?: string };

  if (!sessionId) {
    return Response.json({ error: "sessionId required" }, { status: 400 });
  }

  await db.activeViewer.upsert({
    where: { invoiceId_sessionId: { invoiceId: id, sessionId } },
    create: { invoiceId: id, sessionId },
    update: { lastSeen: new Date() },
  });

  return Response.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const since = new Date(Date.now() - ACTIVE_WINDOW_MS);
  const count = await db.activeViewer.count({
    where: { invoiceId: id, lastSeen: { gte: since } },
  });

  return Response.json({ count });
}
