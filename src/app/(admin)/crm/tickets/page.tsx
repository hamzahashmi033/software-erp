import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { TicketTable } from "@/components/crm/ticket-table";
import { Button } from "@/components/ui/button";

export default function TicketsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Tickets"
        action={
          <Link href="/crm/tickets/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="Support Tickets" description="Track and resolve client support requests" />
        <div className="px-4 sm:px-6 pb-8">
          <TicketTable />
        </div>
      </main>
    </div>
  );
}
