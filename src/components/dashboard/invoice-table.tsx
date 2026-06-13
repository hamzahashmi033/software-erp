"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw, Download } from "lucide-react";
import { InvoiceTableRow } from "./invoice-table-row";
import { InvoiceFilters, type FilterState } from "./invoice-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import type { InvoiceWithCounts } from "@/types/invoice";

const LIMIT = 10;

export function InvoiceTable() {
  const [invoices, setInvoices] = useState<InvoiceWithCounts[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    department: "",
    agent: "",
    dateFrom: "",
    dateTo: "",
  });
  const [downloading, setDownloading] = useState<string | null>(null);

  function handleFiltersChange(newFilters: FilterState) {
    setPage(1);
    setFilters(newFilters);
  }

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.department) params.set("department", filters.department);
      if (filters.agent) params.set("agent", filters.agent);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      const list: InvoiceWithCounts[] = data.invoices ?? [];
      setInvoices(list);
      setTotal(data.total ?? 0);

      const pending = list.filter(
        (inv) => inv.stripeInvoiceId && !["PAID", "VOID", "DRAFT"].includes(inv.status)
      );
      if (pending.length > 0) {
        await Promise.allSettled(
          pending.map((inv) => fetch(`/api/invoices/${inv.id}/sync`, { method: "POST" }))
        );
        const res2 = await fetch(`/api/invoices?${params}`);
        const data2 = await res2.json();
        setInvoices(data2.invoices ?? []);
        setTotal(data2.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  function buildExportParams(statusFilter: "all" | "paid" | "unpaid"): string {
    const params = new URLSearchParams();
    params.set("statusFilter", statusFilter);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.agent) params.set("agent", filters.agent);
    if (filters.department) params.set("department", filters.department);
    return params.toString();
  }

  async function handleDownload(statusFilter: "all" | "paid" | "unpaid") {
    setDownloading(statusFilter);
    try {
      const res = await fetch(`/api/invoices/export?${buildExportParams(statusFilter)}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match ? match[1] : `${statusFilter}-invoices.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-start gap-3">
        <InvoiceFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Download buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Download:</span>
          {(
            [
              { key: "all", label: "All" },
              { key: "paid", label: "Paid" },
              { key: "unpaid", label: "Unpaid" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleDownload(key)}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 rounded-lg border border-[#DCC9F7] bg-white px-3 py-1.5 text-xs font-medium text-[#4027C1] hover:bg-[#F5F3FC] transition-colors disabled:opacity-50"
            >
              <Download className={["h-3.5 w-3.5", downloading === key ? "animate-bounce" : ""].join(" ")} />
              {label} CSV
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvoices}
            className="rounded-md p-2 text-gray-400 hover:bg-[#DCC9F7] hover:text-[#2D1879] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
          </button>
          <Link href="/invoices/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#DCC9F7] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Create your first invoice to get started."
            action={
              <Link href="/invoices/new">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#ece8f8] bg-[#F5F3FC]">
                    {["Client", "Type", "Status", "Amount", "Views", "Created By", "Date", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#4027C1]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <InvoiceTableRow
                      key={invoice.id}
                      invoice={invoice}
                      onRefresh={fetchInvoices}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
