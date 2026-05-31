"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, timeAgo } from "@/lib/invoice-helpers";
import type { InvoiceWithCounts } from "@/types/invoice";

const LIMIT = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "VIEWED", label: "Viewed" },
  { value: "PAID", label: "Paid" },
  { value: "VOID", label: "Void" },
  { value: "PAYMENT_FAILED", label: "Failed" },
];

export function AgentInvoicesList() {
  const [invoices, setInvoices] = useState<InvoiceWithCounts[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/agent/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.invoices ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  async function handleCopyLink(invoice: InvoiceWithCounts) {
    const url = (invoice as { stripeHostedUrl?: string }).stripeHostedUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopiedId(invoice.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = search || status;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">My Invoices</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-48 rounded-lg border border-[#DCC9F7] bg-white pl-8 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4027C1]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-[#DCC9F7] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4027C1]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPage(1);
              }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#4027C1] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          <button
            onClick={fetchInvoices}
            className="rounded-md p-2 text-gray-400 hover:bg-[#DCC9F7] hover:text-[#2D1879] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#DCC9F7] bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Invoices you create will appear here."
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
                {invoices.map((invoice) => {
                  const stripeHostedUrl = (invoice as { stripeHostedUrl?: string }).stripeHostedUrl;
                  const departmentColor =
                    invoice.department === "FRONT"
                      ? "text-[#4027C1] bg-[#DCC9F7]"
                      : "text-purple-800 bg-purple-100";
                  return (
                    <tr
                      key={invoice.id}
                      className="border-t border-[#ece8f8] hover:bg-[#F5F3FC] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{invoice.clientName}</p>
                        <p className="text-xs text-gray-400">{invoice.clientEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            departmentColor,
                          ].join(" ")}
                        >
                          {invoice.department}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {invoice._count.views}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {timeAgo(invoice.createdAt)}
                        {invoice.paidAt && (
                          <p className="text-emerald-600 font-medium">
                            Paid {timeAgo(invoice.paidAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {stripeHostedUrl && (
                            <a
                              href={stripeHostedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open invoice"
                              className="rounded-md p-1.5 text-[#4027C1] hover:bg-[#DCC9F7] transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {stripeHostedUrl && (
                            <button
                              onClick={() => handleCopyLink(invoice)}
                              title="Copy invoice link"
                              className="rounded-md p-1.5 text-gray-400 hover:bg-[#DCC9F7] hover:text-[#2D1879] transition-colors"
                            >
                              {copiedId === invoice.id ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
