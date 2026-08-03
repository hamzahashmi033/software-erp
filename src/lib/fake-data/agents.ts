export interface FakeAgent {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const FAKE_AGENTS: FakeAgent[] = [
  { id: "demo-agent-001", name: "Morgan Ellis", email: "morgan.ellis@example.com", createdAt: daysAgo(120) },
  { id: "demo-agent-002", name: "Taylor Reid", email: "taylor.reid@example.com", createdAt: daysAgo(95) },
  { id: "demo-agent-003", name: "Avery Nolan", email: "avery.nolan@example.com", createdAt: daysAgo(80) },
  { id: "demo-agent-004", name: "Cameron Hayes", email: "cameron.hayes@example.com", createdAt: daysAgo(60) },
  { id: "demo-agent-005", name: "Skyler Brooks", email: "skyler.brooks@example.com", createdAt: daysAgo(40) },
  { id: "demo-agent-006", name: "Peyton Marsh", email: "peyton.marsh@example.com", createdAt: daysAgo(15) },
];

export function isFakeAgentDataEnabled(): boolean {
  return process.env.USE_FAKE_AGENT_DATA === "true";
}
