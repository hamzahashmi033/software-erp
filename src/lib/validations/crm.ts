import { z } from "zod";

export const CLIENT_STATUS_VALUES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export const LEAD_STATUS_VALUES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const;
export const LEAD_ACTIVITY_TYPE_VALUES = ["CALL", "EMAIL", "MEETING", "NOTE"] as const;
export const PIPELINE_STAGE_VALUES = [
  "LEAD",
  "QUALIFIED",
  "MEETING",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;
export const TICKET_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const TICKET_STATUS_VALUES = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const;

const emailOrEmpty = z.string().email("Valid email is required").optional().or(z.literal(""));

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  legalName: z.string().optional(),
  email: emailOrEmpty,
  phone: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(CLIENT_STATUS_VALUES).default("ACTIVE"),
  tags: z.string().optional(),
  notes: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  accountManagerId: z.string().optional(),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const createClientContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailOrEmpty,
  phone: z.string().optional(),
  title: z.string().optional(),
  isPrimary: z.boolean().default(false),
});
export type CreateClientContactInput = z.infer<typeof createClientContactSchema>;

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailOrEmpty,
  phone: z.string().optional(),
  companyName: z.string().optional(),
  source: z.string().min(1, "Source is required"),
  status: z.enum(LEAD_STATUS_VALUES).default("NEW"),
  notes: z.string().optional(),
  assigneeId: z.string().optional(),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const createLeadActivitySchema = z.object({
  type: z.enum(LEAD_ACTIVITY_TYPE_VALUES),
  note: z.string().min(1, "Note is required"),
});
export type CreateLeadActivityInput = z.infer<typeof createLeadActivitySchema>;

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  stage: z.enum(PIPELINE_STAGE_VALUES).default("LEAD"),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
  ownerId: z.string().optional(),
  expectedClose: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateDealInput = z.infer<typeof createDealSchema>;

export const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(TICKET_PRIORITY_VALUES).default("MEDIUM"),
  status: z.enum(TICKET_STATUS_VALUES).default("OPEN"),
  clientId: z.string().optional(),
  assigneeId: z.string().optional(),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
