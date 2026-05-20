"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw } from "lucide-react";
import { InvoiceTableRow } from "./invoice-table-row";
import { InvoiceFilters } from "./invoice-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { InvoiceWithCounts } from "@/types/invoice";

interface FilterState {
  search: string;
  status: string;
  department: string;
}

export function InvoiceTable() {
  const [invoices, setInvoices] = useState<InvoiceWithCounts[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    department: "",
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.department) params.set("department", filters.department);
      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.invoices ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InvoiceFilters filters={filters} onChange={setFilters} />
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
      <div className="rounded-xl border border-[#DCC9F7] bg-white shadow-sm">
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
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ece8f8] bg-[#F5F3FC]">
                {["Client", "Type", "Status", "Amount", "Views", "Date", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#4027C1]"
                    >
                      {h}
                    </th>
                  )
                )}
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
        )}

        {total > 0 && !loading && (
          <div className="border-t border-[#ece8f8] px-4 py-3 text-xs text-gray-400">
            Showing {invoices.length} of {total} invoices
          </div>
        )}
      </div>
    </div>
  );
}
