import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/crm/client-form";

export default function NewClientPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="New Client" />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="Create Client" description="Add a new client account" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
          <ClientForm />
        </div>
      </main>
    </div>
  );
}
