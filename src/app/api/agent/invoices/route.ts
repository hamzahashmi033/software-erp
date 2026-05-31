import { db } from "@/lib/prisma";
import { getAgentSession } from "@/lib/auth";
import type { InvoiceStatus } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  const session = await getAgentSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as InvoiceStatus | null;
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const skip = (page - 1) * limit;

  const where = {
    createdByAgentEmail: session.email,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { clientName: { contains: search, mode: "insensitive" as const } },
            { clientEmail: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { views: true, activeViewers: true } },
      },
    }),
    db.invoice.count({ where }),
  ]);

  return Response.json({ invoices, total, page, limit });
}
