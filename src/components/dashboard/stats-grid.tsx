import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react";
import { StatCard } from "./stat-card";
import { formatCurrency } from "@/lib/invoice-helpers";
import type { DashboardStats } from "@/types/invoice";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Total Invoices"
        value={stats.total}
        icon={FileText}
        sub={`${stats.draft} draft · ${stats.void} void`}
        color="purple"
      />
      <StatCard
        label="Revenue Collected"
        value={formatCurrency(stats.totalRevenue)}
        icon={DollarSign}
        sub={`${stats.paid} paid invoice${stats.paid !== 1 ? "s" : ""}`}
        color="green"
      />
      <StatCard
        label="Pending"
        value={formatCurrency(stats.pendingRevenue)}
        icon={Clock}
        sub={`${stats.sent + stats.viewed} awaiting payment`}
        color="amber"
      />
      <StatCard
        label="Paid"
        value={stats.paid}
        icon={CheckCircle}
        sub={`${stats.frontCount} front · ${stats.upsellCount} upsell`}
        color="blue"
      />
    </div>
  );
}
