import { getAgentSession } from "@/lib/auth";
import { AgentInvoicePage } from "@/components/agent/agent-invoice-page";

export default async function NewInvoicePage() {
  const session = await getAgentSession();
  return <AgentInvoicePage agentName={session?.name ?? ""} agentEmail={session?.email ?? ""} />;
}
