"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
}

export interface FilterState {
  search: string;
  status: string;
  department: string;
  agent: string;
  dateFrom: string;
  dateTo: string;
}

interface InvoiceFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "VIEWED", label: "Viewed" },
  { value: "PAID", label: "Paid" },
  { value: "VOID", label: "Void" },
  { value: "PAYMENT_FAILED", label: "Failed" },
];

const DEPT_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "FRONT", label: "Front" },
  { value: "UPSELL", label: "Upsell" },
];

const inputClass =
  "h-9 rounded-lg border border-[#DCC9F7] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4027C1]";

export function InvoiceFilters({ filters, onChange }: InvoiceFiltersProps) {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents ?? []))
      .catch(() => {});
  }, []);

  const hasFilters =
    filters.search ||
    filters.status ||
    filters.department ||
    filters.agent ||
    filters.dateFrom ||
    filters.dateTo;

  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({ search: "", status: "", department: "", agent: "", dateFrom: "", dateTo: "" });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search client..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="h-9 w-full sm:w-48 rounded-lg border border-[#DCC9F7] bg-white pl-8 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4027C1]"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className={inputClass}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Department */}
      <select
        value={filters.department}
        onChange={(e) => update("department", e.target.value)}
        className={inputClass}
      >
        {DEPT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Agent */}
      <select
        value={filters.agent}
        onChange={(e) => update("agent", e.target.value)}
        className={inputClass}
      >
        <option value="">All Agents</option>
        {agents.map((a) => (
          <option key={a.id} value={a.email}>{a.name}</option>
        ))}
      </select>

      {/* Date From */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 whitespace-nowrap">From</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
          className={inputClass + " w-36"}
        />
      </div>

      {/* Date To */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 whitespace-nowrap">To</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
          className={inputClass + " w-36"}
        />
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#4027C1] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
