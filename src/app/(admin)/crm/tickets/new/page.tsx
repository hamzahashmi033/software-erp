import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { TicketForm } from "@/components/crm/ticket-form";

export default function NewTicketPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="New Ticket" />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="Create Ticket" description="Log a new support request" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
          <TicketForm />
        </div>
      </main>
    </div>
  );
}
