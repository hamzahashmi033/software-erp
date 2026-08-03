import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { ClientTable } from "@/components/crm/client-table";
import { Button } from "@/components/ui/button";

export default function ClientsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Clients"
        action={
          <Link href="/crm/clients/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Client
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="All Clients" description="Manage your client accounts and relationships" />
        <div className="px-4 sm:px-6 pb-8">
          <ClientTable />
        </div>
      </main>
    </div>
  );
}
