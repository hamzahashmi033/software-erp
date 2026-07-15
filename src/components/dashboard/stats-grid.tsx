"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react";
import { StatCard } from "./stat-card";
import { formatCurrency } from "@/lib/invoice-helpers";
import { toSearchParams, type FilterState } from "./invoice-filters";
import type { DashboardStats } from "@/types/invoice";

interface StatsGridProps {
  filters: FilterState;
}

const EMPTY_STATS: DashboardStats = {
  total: 0,
  paid: 0,
  sent: 0,
  viewed: 0,
  draft: 0,
  void: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
  frontCount: 0,
  upsellCount: 0,
};

export function StatsGrid({ filters }: StatsGridProps) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);

  useEffect(() => {
    let cancelled = false;
    const params = toSearchParams(filters);
    fetch(`/api/dashboard/stats?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [filters]);

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
