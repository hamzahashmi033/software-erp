"use client";

import { useState } from "react";
import type { FilterState } from "./invoice-filters";
import { StatsGrid } from "./stats-grid";
import { InvoiceTable } from "./invoice-table";

const INITIAL_FILTERS: FilterState = {
  search: "",
  status: "",
  department: "",
  agent: "",
  dateFrom: "",
  dateTo: "",
};

export function DashboardContent() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  return (
    <div className="space-y-8 px-4 sm:px-6 pb-8">
      <StatsGrid filters={filters} />
      <InvoiceTable filters={filters} onFiltersChange={setFilters} />
    </div>
  );
}
