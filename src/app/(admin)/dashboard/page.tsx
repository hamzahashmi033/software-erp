import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Dashboard" />
      <main className="flex-1 overflow-y-auto">
        <PageHeader
          title="Overview"
          description="All invoices and revenue at a glance"
        />
        <DashboardContent />
      </main>
    </div>
  );
}
