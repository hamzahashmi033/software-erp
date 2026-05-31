import { getAgentSession } from "@/lib/auth";
import { AgentShell } from "@/components/agent/agent-shell";
import { AgentInvoicesList } from "@/components/agent/agent-invoices-list";

export default async function AgentInvoicesPage() {
  await getAgentSession();
  return (
    <AgentShell>
      <AgentInvoicesList />
    </AgentShell>
  );
}
