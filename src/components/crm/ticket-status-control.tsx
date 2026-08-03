"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TICKET_STATUS_VALUES } from "@/lib/validations/crm";

export function TicketStatusControl({ ticketId, status }: { ticketId: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    setSaving(true);
    try {
      await fetch(`/api/crm/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 rounded-lg border border-white/30 bg-white/10 px-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
    >
      {TICKET_STATUS_VALUES.map((s) => (
        <option key={s} value={s} className="text-gray-900">{s}</option>
      ))}
    </select>
  );
}
