"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { clientStatusColor } from "@/lib/crm-helpers";

const LIMIT = 10;

interface ClientRow {
  id: string;
  name: string;
  email: string | null;
  industry: string | null;
  status: string;
  createdAt: string;
  User: { id: string; name: string } | null;
  _count: { Invoice: number; Deal: number; Ticket: number; ClientContact: number };
}

export function ClientTable() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      const res = await fetch(`/api/crm/clients?${params}`);
      const data = await res.json();
      setClients(data.clients ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search clients..."
            className="w-full rounded-lg border border-[#FED7AA] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="h-9 rounded-lg border border-[#FED7AA] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={fetchClients}
            className="rounded-md p-2 text-gray-400 hover:bg-[#FED7AA] hover:text-[#7C2D12] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
          </button>
          <Link href="/crm/clients/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Client
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[#FED7AA] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            title="No clients found"
            description="Create your first client to get started."
            action={
              <Link href="/crm/clients/new">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4" />
                  New Client
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#FFEDD5] bg-[#FFF7ED]">
                    {["Name", "Industry", "Account Manager", "Status", "Invoices", "Deals", "Tickets", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#EA580C]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFEDD5]">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#FFF7ED] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client.industry ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client.User?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={clientStatusColor(client.status as "ACTIVE" | "INACTIVE" | "ARCHIVED")}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client._count.Invoice}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client._count.Deal}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client._count.Ticket}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/crm/clients/${client.id}`} className="text-xs font-medium text-[#EA580C] hover:underline">
                          View
                        </Link>
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
