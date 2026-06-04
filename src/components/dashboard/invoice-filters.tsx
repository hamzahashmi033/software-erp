"use client";

import { Search, X } from "lucide-react";

interface FilterState {
  search: string;
  status: string;
  department: string;
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

export function InvoiceFilters({ filters, onChange }: InvoiceFiltersProps) {
  const hasFilters = filters.search || filters.status || filters.department;

  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({ search: "", status: "", department: "" });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
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

      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="h-9 rounded-lg border border-[#DCC9F7] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4027C1]"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={filters.department}
        onChange={(e) => update("department", e.target.value)}
        className="h-9 rounded-lg border border-[#DCC9F7] bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4027C1]"
      >
        {DEPT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

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
