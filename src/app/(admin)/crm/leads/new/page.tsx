import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { LeadForm } from "@/components/crm/lead-form";

export default function NewLeadPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="New Lead" />
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="Create Lead" description="Add a new lead to the pipeline" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
          <LeadForm />
        </div>
      </main>
    </div>
  );
}
