import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="New Invoice" />
      <main className="flex-1 overflow-y-auto">
        <PageHeader
          title="Create Invoice"
          description="Fill in the details below. The invoice will be sent to the client automatically."
        />
        <div className="px-6 pb-8">
          <InvoiceForm />
        </div>
      </main>
    </div>
  );
}
