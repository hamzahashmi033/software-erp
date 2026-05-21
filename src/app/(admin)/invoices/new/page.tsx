import { TopBar } from "@/components/layout/top-bar";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="New Invoice" />
      <main className="flex-1 overflow-y-auto py-8">
        <InvoiceForm />
      </main>
    </div>
  );
}
