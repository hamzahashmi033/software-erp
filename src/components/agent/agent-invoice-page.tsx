"use client";

import { useState } from "react";
import { InvoiceForm, type InvoiceResult } from "@/components/invoices/invoice-form";
import { AgentInvoiceSuccess } from "./agent-invoice-success";
import { AgentShell } from "./agent-shell";

export function AgentInvoicePage({ agentName, agentEmail }: { agentName: string; agentEmail: string }) {
  const [successInvoice, setSuccessInvoice] = useState<InvoiceResult | null>(null);

  if (successInvoice) {
    return (
      <AgentInvoiceSuccess
        invoice={successInvoice}
        onCreateAnother={() => setSuccessInvoice(null)}
      />
    );
  }

  return (
    <AgentShell>
      <main>
        <div className="mb-6 py-10 sm:py-22 bg-[#7430FF]">
          <h1 className="text-3xl sm:text-5xl font-bold text-center text-white">Payment Form</h1>
        </div>

        <InvoiceForm
          agentName={agentName || undefined}
          agentEmail={agentEmail || undefined}
          onSuccess={(invoice) => setSuccessInvoice(invoice)}
        />
      </main>
    </AgentShell>
  );
}
