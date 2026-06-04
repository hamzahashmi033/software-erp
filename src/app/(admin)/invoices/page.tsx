import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import { Button } from "@/components/ui/button";

export default function InvoicesPage() {
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
          <InvoiceTable />
        </div>
      </main>
    </div>
  );
}
