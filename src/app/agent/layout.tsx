import { redirect } from "next/navigation";
import { getAgentSession } from "@/lib/auth";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await getAgentSession();
  if (!session) redirect("/agent-login");
  return <>{children}</>;
}
