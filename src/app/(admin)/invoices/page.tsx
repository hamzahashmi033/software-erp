"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import type { FilterState } from "@/components/dashboard/invoice-filters";
import { Button } from "@/components/ui/button";

const INITIAL_FILTERS: FilterState = {
  search: "",
  status: "",
  department: "",
  agent: "",
  dateFrom: "",
  dateTo: "",
};

export default function InvoicesPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Invoices"
        action={
          <Link href="/invoices/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <PageHeader
          title="All Invoices"
          description="Manage and track all your invoices"
        />
        <div className="px-4 sm:px-6 pb-8">
          <InvoiceTable filters={filters} onFiltersChange={setFilters} />
        </div>
      </main>
    </div>
  );
}
