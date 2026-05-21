"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { InvoiceForm, type InvoiceResult } from "@/components/invoices/invoice-form";
import { AgentInvoiceSuccess } from "./agent-invoice-success";

export function AgentInvoicePage({ agentName, agentEmail }: { agentName: string; agentEmail: string }) {
  const router = useRouter();
  const [successInvoice, setSuccessInvoice] = useState<InvoiceResult | null>(null);

  function handleLogout() {
    fetch("/api/auth/agent-logout", { method: "POST" }).finally(() => {
      router.push("/agent-login");
    });
  }

  if (successInvoice) {
    return (
      <AgentInvoiceSuccess
        invoice={successInvoice}
        onCreateAnother={() => setSuccessInvoice(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FC]">
      <header className="sticky top-0 z-10 border-b border-[#DCC9F7] bg-white px-6 py-3">
        <div className="max-w-6xl flex items-center justify-between m-auto">
          <div className="flex items-center gap-3">
            <img src="/logo-v2-1.png" className="h-14 w-auto object-contain" />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="">
        <div className="mb-6 py-22 bg-[#7430FF]">
          <h1 className="text-5xl font-bold text-center text-white">Payment Form</h1>
        </div>

        <InvoiceForm
          agentName={agentName || undefined}
          agentEmail={agentEmail || undefined}
          onSuccess={(invoice) => setSuccessInvoice(invoice)}
        />
      </main>
    </div>
  );
}
