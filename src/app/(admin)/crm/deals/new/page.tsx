import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { DealForm } from "@/components/crm/deal-form";

export default function NewDealPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="New Deal" />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="Create Deal" description="Add a new deal to the pipeline" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
          <DealForm />
        </div>
      </main>
    </div>
  );
}
