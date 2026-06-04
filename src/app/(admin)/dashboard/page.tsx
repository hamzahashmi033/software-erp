import { db } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import type { DashboardStats } from "@/types/invoice";

async function getStats(): Promise<DashboardStats> {
  const [statusGroups, deptGroups, paidRevenue, pendingRevenue] = await Promise.all([
    db.invoice.groupBy({ by: ["status"], _count: { _all: true } }),
    db.invoice.groupBy({ by: ["department"], _count: { _all: true } }),
    db.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "PAID" } }),
    db.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["SENT", "VIEWED"] } },
    }),
  ]);

  const counts = Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all]));
  const depts = Object.fromEntries(deptGroups.map((g) => [g.department, g._count._all]));
  const total = statusGroups.reduce((s, g) => s + g._count._all, 0);

  return {
    total,
    paid: counts.PAID ?? 0,
    sent: counts.SENT ?? 0,
    viewed: counts.VIEWED ?? 0,
    draft: counts.DRAFT ?? 0,
    void: counts.VOID ?? 0,
    totalRevenue: paidRevenue._sum.totalAmount ?? 0,
    pendingRevenue: pendingRevenue._sum.totalAmount ?? 0,
    frontCount: depts.FRONT ?? 0,
    upsellCount: depts.UPSELL ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Dashboard" />
      <main className="flex-1 overflow-y-auto">
        <PageHeader
          title="Overview"
          description="All invoices and revenue at a glance"
        />
        <div className="space-y-8 px-4 sm:px-6 pb-8">
          <StatsGrid stats={stats} />
          <InvoiceTable />
        </div>
      </main>
    </div>
  );
}
