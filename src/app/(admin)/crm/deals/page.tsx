import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { DealTable } from "@/components/crm/deal-table";
import { Button } from "@/components/ui/button";

export default function DealsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Deals"
        action={
          <Link href="/crm/deals/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Deal
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="Pipeline" description="Track deals through your sales pipeline" />
        <div className="px-4 sm:px-6 pb-8">
          <DealTable />
        </div>
      </main>
    </div>
  );
}
