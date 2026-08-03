"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ticketPriorityColor, ticketStatusColor } from "@/lib/crm-helpers";
import { TICKET_PRIORITY_VALUES, TICKET_STATUS_VALUES } from "@/lib/validations/crm";

const LIMIT = 10;

interface TicketRow {
  id: string;
  subject: string;
  priority: typeof TICKET_PRIORITY_VALUES[number];
  status: typeof TICKET_STATUS_VALUES[number];
  createdAt: string;
  Client: { id: string; name: string } | null;
  User_Ticket_assigneeIdToUser: { id: string; name: string } | null;
}

export function TicketTable() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      const res = await fetch(`/api/crm/tickets?${params}`);
      const data = await res.json();
      setTickets(data.tickets ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search tickets..."
            className="w-full rounded-lg border border-[#FED7AA] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="h-9 rounded-lg border border-[#FED7AA] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
        >
          <option value="">All statuses</option>
          {TICKET_STATUS_VALUES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={priority}
          onChange={(e) => { setPage(1); setPriority(e.target.value); }}
          className="h-9 rounded-lg border border-[#FED7AA] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
        >
          <option value="">All priorities</option>
          {TICKET_PRIORITY_VALUES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchTickets} className="rounded-md p-2 text-gray-400 hover:bg-[#FED7AA] hover:text-[#7C2D12] transition-colors" title="Refresh">
            <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
          </button>
          <Link href="/crm/tickets/new">
            <Button size="sm"><PlusCircle className="h-4 w-4" />New Ticket</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[#FED7AA] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner /></div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description="Create your first ticket to get started."
            action={<Link href="/crm/tickets/new"><Button size="sm"><PlusCircle className="h-4 w-4" />New Ticket</Button></Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#FFEDD5] bg-[#FFF7ED]">
                    {["Subject", "Client", "Assignee", "Priority", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#EA580C]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFEDD5]">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#FFF7ED] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ticket.Client?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ticket.User_Ticket_assigneeIdToUser?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ticketPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ticketStatusColor(ticket.status)}>{ticket.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/crm/tickets/${ticket.id}`} className="text-xs font-medium text-[#EA580C] hover:underline">View</Link>
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
