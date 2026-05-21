import { z } from "zod";

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be 0 or more"),
});

export const createInvoiceSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientContact: z.string().optional(),
  packageName: z.string().optional(),
  department: z.enum(["FRONT", "UPSELL"]),
  descriptionHtml: z.string().min(1, "Description is required"),
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
  currency: z.string().default("usd"),
  paymentMerchant: z.enum(["STRIPE"]).default("STRIPE"),
  taxRate: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
