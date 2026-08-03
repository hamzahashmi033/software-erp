type ClientStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
type PipelineStage = "LEAD" | "QUALIFIED" | "MEETING" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";

type Color = "green" | "yellow" | "blue" | "gray" | "red" | "orange" | "purple";

export function buildClientWhere(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  return {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export function buildLeadWhere(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  return {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { companyName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export function buildDealWhere(searchParams: URLSearchParams) {
  const stage = searchParams.get("stage") as PipelineStage | null;
  const search = searchParams.get("search");

  return {
    ...(stage ? { stage } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
  };
}

export function buildTicketWhere(searchParams: URLSearchParams) {
  const status = searchParams.get("status") as TicketStatus | null;
  const priority = searchParams.get("priority") as TicketPriority | null;
  const search = searchParams.get("search");

  return {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(search ? { subject: { contains: search, mode: "insensitive" as const } } : {}),
  };
}

export function clientStatusColor(status: ClientStatus): Color {
  const colors: Record<ClientStatus, Color> = {
    ACTIVE: "green",
    INACTIVE: "gray",
    ARCHIVED: "red",
  };
  return colors[status];
}

export function leadStatusColor(status: LeadStatus): Color {
  const colors: Record<LeadStatus, Color> = {
    NEW: "blue",
    CONTACTED: "yellow",
    QUALIFIED: "purple",
    CONVERTED: "green",
    LOST: "red",
  };
  return colors[status];
}

export function pipelineStageColor(stage: PipelineStage): Color {
  const colors: Record<PipelineStage, Color> = {
    LEAD: "gray",
    QUALIFIED: "blue",
    MEETING: "yellow",
    PROPOSAL: "purple",
    NEGOTIATION: "orange",
    WON: "green",
    LOST: "red",
  };
  return colors[stage];
}

export function pipelineStageLabel(stage: PipelineStage): string {
  const labels: Record<PipelineStage, string> = {
    LEAD: "Lead",
    QUALIFIED: "Qualified",
    MEETING: "Meeting",
    PROPOSAL: "Proposal",
    NEGOTIATION: "Negotiation",
    WON: "Won",
    LOST: "Lost",
  };
  return labels[stage];
}

export function ticketPriorityColor(priority: TicketPriority): Color {
  const colors: Record<TicketPriority, Color> = {
    LOW: "gray",
    MEDIUM: "blue",
    HIGH: "orange",
    CRITICAL: "red",
  };
  return colors[priority];
}

export function ticketStatusColor(status: TicketStatus): Color {
  const colors: Record<TicketStatus, Color> = {
    OPEN: "blue",
    IN_PROGRESS: "yellow",
    WAITING: "orange",
    RESOLVED: "green",
    CLOSED: "gray",
  };
  return colors[status];
}
