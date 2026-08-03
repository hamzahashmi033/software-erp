import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { LeadTable } from "@/components/crm/lead-table";
import { Button } from "@/components/ui/button";

export default function LeadsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Leads"
        action={
          <Link href="/crm/leads/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Lead
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="All Leads" description="Track and qualify incoming leads" />
        <div className="px-4 sm:px-6 pb-8">
          <LeadTable />
        </div>
      </main>
    </div>
  );
}
