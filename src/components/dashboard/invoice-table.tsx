"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw } from "lucide-react";
import { InvoiceTableRow } from "./invoice-table-row";
import { InvoiceFilters } from "./invoice-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import type { InvoiceWithCounts } from "@/types/invoice";

const LIMIT = 10;

interface FilterState {
  search: string;
  status: string;
  department: string;
}

export function InvoiceTable() {
  const [invoices, setInvoices] = useState<InvoiceWithCounts[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    department: "",
  });

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
      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      const list: InvoiceWithCounts[] = data.invoices ?? [];
      setInvoices(list);
      setTotal(data.total ?? 0);

      // Silently sync any pending Stripe invoices so paid status is always fresh
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

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InvoiceFilters filters={filters} onChange={handleFiltersChange} />
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
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#ece8f8] bg-[#F5F3FC]">
                  {["Client", "Type", "Status", "Amount", "Views", "Date", ""].map((h) => (
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
