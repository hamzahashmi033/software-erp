"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { pipelineStageColor, pipelineStageLabel } from "@/lib/crm-helpers";
import { formatCurrency } from "@/lib/invoice-helpers";

const LIMIT = 10;
const STAGES = ["LEAD", "QUALIFIED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;

interface DealRow {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: typeof STAGES[number];
  expectedClose: string | null;
  Client: { id: string; name: string } | null;
  User: { id: string; name: string } | null;
}

export function DealTable() {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (stage) params.set("stage", stage);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      const res = await fetch(`/api/crm/deals?${params}`);
      const data = await res.json();
      setDeals(data.deals ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, stage, page]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search deals..."
            className="w-full rounded-lg border border-[#FED7AA] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          />
        </div>
        <select
          value={stage}
          onChange={(e) => { setPage(1); setStage(e.target.value); }}
          className="h-9 rounded-lg border border-[#FED7AA] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{pipelineStageLabel(s)}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchDeals} className="rounded-md p-2 text-gray-400 hover:bg-[#FED7AA] hover:text-[#7C2D12] transition-colors" title="Refresh">
            <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
          </button>
          <Link href="/crm/deals/new">
            <Button size="sm"><PlusCircle className="h-4 w-4" />New Deal</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[#FED7AA] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner /></div>
        ) : deals.length === 0 ? (
          <EmptyState
            title="No deals found"
            description="Create your first deal to get started."
            action={<Link href="/crm/deals/new"><Button size="sm"><PlusCircle className="h-4 w-4" />New Deal</Button></Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#FFEDD5] bg-[#FFF7ED]">
                    {["Title", "Client", "Owner", "Stage", "Value", "Expected Close", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#EA580C]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFEDD5]">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-[#FFF7ED] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{deal.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{deal.Client?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{deal.User?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={pipelineStageColor(deal.stage)}>{pipelineStageLabel(deal.stage)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(deal.value, deal.currency)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/crm/deals/${deal.id}`} className="text-xs font-medium text-[#EA580C] hover:underline">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
