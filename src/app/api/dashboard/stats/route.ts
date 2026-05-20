import { db } from "@/lib/prisma";

export async function GET() {
  const [statusGroups, deptGroups, revenueResult] = await Promise.all([
    db.invoice.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.invoice.groupBy({
      by: ["department"],
      _count: { _all: true },
    }),
    db.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID" },
    }),
  ]);

  const pendingRevenue = await db.invoice.aggregate({
    _sum: { totalAmount: true },
    where: { status: { in: ["SENT", "VIEWED"] } },
  });

  const counts = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all])
  );
  const deptCounts = Object.fromEntries(
    deptGroups.map((g) => [g.department, g._count._all])
  );

  const total = statusGroups.reduce((sum, g) => sum + g._count._all, 0);

  return Response.json({
    total,
    paid: counts.PAID ?? 0,
    sent: counts.SENT ?? 0,
    viewed: counts.VIEWED ?? 0,
    draft: counts.DRAFT ?? 0,
    void: counts.VOID ?? 0,
    totalRevenue: revenueResult._sum.totalAmount ?? 0,
    pendingRevenue: pendingRevenue._sum.totalAmount ?? 0,
    frontCount: deptCounts.FRONT ?? 0,
    upsellCount: deptCounts.UPSELL ?? 0,
  });
}
