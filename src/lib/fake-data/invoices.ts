import type { InvoiceStatus, Department, PaymentMerchant } from "@/generated/prisma/enums";

export interface FakeInvoiceView {
  id: string;
  invoiceId: string;
  ip: string | null;
  userAgent: string | null;
  viewedAt: Date;
}

export interface FakeInvoice {
  id: string;
  stripeInvoiceId: string | null;
  stripeCustomerId: string | null;
  stripeHostedUrl: string | null;
  clientName: string;
  clientEmail: string;
  clientContact: string | null;
  packageName: string | null;
  department: Department;
  descriptionHtml: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  currency: string;
  taxRate: number | null;
  dueDate: Date | null;
  notes: string | null;
  status: InvoiceStatus;
  paymentMerchant: PaymentMerchant;
  stripePayUrl: string | null;
  createdByAgent: string | null;
  createdByAgentEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
  paidAt: Date | null;
  amountPaid: number;
  clientId: string | null;
  views: FakeInvoiceView[];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function invoice(
  index: number,
  clientName: string,
  clientEmail: string,
  packageName: string,
  department: Department,
  status: InvoiceStatus,
  totalAmount: number,
  createdDaysAgo: number,
  agent: string,
  agentEmail: string,
  viewCount: number
): FakeInvoice {
  const id = `demo-${String(index).padStart(3, "0")}`;
  const createdAt = daysAgo(createdDaysAgo);
  const sentAt = status === "DRAFT" ? null : new Date(createdAt.getTime() + 1000 * 60 * 30);
  const paidAt = status === "PAID" ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 2) : null;

  return {
    id,
    stripeInvoiceId: null,
    stripeCustomerId: null,
    stripeHostedUrl: null,
    clientName,
    clientEmail,
    clientContact: null,
    packageName,
    department,
    descriptionHtml: `<p>${packageName} — scope and deliverables as discussed.</p>`,
    items: [
      { description: packageName, quantity: 1, unitPrice: totalAmount / 100 },
    ],
    totalAmount,
    currency: "usd",
    taxRate: null,
    dueDate: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 14),
    notes: null,
    status,
    paymentMerchant: "STRIPE",
    stripePayUrl: null,
    createdByAgent: agent,
    createdByAgentEmail: agentEmail,
    createdAt,
    updatedAt: createdAt,
    sentAt,
    paidAt,
    amountPaid: status === "PAID" ? totalAmount : 0,
    clientId: null,
    views: Array.from({ length: viewCount }, (_, i) => ({
      id: `${id}-view-${i}`,
      invoiceId: id,
      ip: `192.168.1.${10 + i}`,
      userAgent: "Mozilla/5.0",
      viewedAt: new Date(createdAt.getTime() + 1000 * 60 * (60 + i * 45)),
    })),
  };
}

const AGENTS: [string, string][] = [
  ["Jordan Blake", "jordan.blake@example.com"],
  ["Casey Morgan", "casey.morgan@example.com"],
  ["Riley Chen", "riley.chen@example.com"],
];

export const FAKE_INVOICES: FakeInvoice[] = [
  invoice(1, "Northwind Traders", "billing@northwindtraders.example", "Brand Identity Package", "FRONT", "PAID", 450000, 3, ...AGENTS[0], 5),
  invoice(2, "Bluepeak Studios", "accounts@bluepeakstudios.example", "Website Redesign", "FRONT", "PAID", 820000, 6, ...AGENTS[1], 3),
  invoice(3, "Everline Logistics", "finance@everline.example", "Logo & Style Guide", "FRONT", "SENT", 280000, 2, ...AGENTS[2], 2),
  invoice(4, "Cobalt Retail Group", "ap@cobaltretail.example", "E-commerce Build", "UPSELL", "VIEWED", 1250000, 4, ...AGENTS[0], 4),
  invoice(5, "Harborview Consulting", "billing@harborviewconsulting.example", "Pitch Deck Design", "FRONT", "PAID", 175000, 10, ...AGENTS[1], 6),
  invoice(6, "Silverline Media", "accounts@silverlinemedia.example", "Social Media Kit", "UPSELL", "DRAFT", 95000, 1, ...AGENTS[2], 0),
  invoice(7, "Granite Peak Realty", "invoices@granitepeakrealty.example", "Brochure Design", "FRONT", "PAID", 320000, 14, ...AGENTS[0], 3),
  invoice(8, "Amberline Foods", "ap@amberlinefoods.example", "Packaging Design", "FRONT", "SENT", 410000, 5, ...AGENTS[1], 1),
  invoice(9, "Vertex Fitness", "billing@vertexfitness.example", "App UI Design", "UPSELL", "PAID", 980000, 20, ...AGENTS[2], 8),
  invoice(10, "Crestline Legal", "accounts@crestlinelegal.example", "Website Refresh", "FRONT", "PAID", 540000, 8, ...AGENTS[0], 4),
  invoice(11, "Pinewood Interiors", "finance@pinewoodinteriors.example", "Catalog Design", "FRONT", "VOID", 210000, 25, ...AGENTS[1], 1),
  invoice(12, "Solstice Travel Co", "billing@solsticetravel.example", "Brand Refresh", "UPSELL", "PAID", 675000, 12, ...AGENTS[2], 5),
  invoice(13, "Ironforge Manufacturing", "ap@ironforgemfg.example", "Product Sheets", "FRONT", "SENT", 150000, 3, ...AGENTS[0], 2),
  invoice(14, "Willow Creek Bakery", "accounts@willowcreekbakery.example", "Packaging Refresh", "FRONT", "PAID", 220000, 30, ...AGENTS[1], 4),
  invoice(15, "Nimbus Cloud Services", "billing@nimbuscloud.example", "Landing Page Design", "UPSELL", "PAYMENT_FAILED", 390000, 7, ...AGENTS[2], 2),
  invoice(16, "Copperfield & Co", "finance@copperfieldco.example", "Annual Report Design", "FRONT", "PAID", 720000, 40, ...AGENTS[0], 6),
  invoice(17, "Lakeshore Dental Group", "ap@lakeshoredental.example", "Website Build", "FRONT", "DRAFT", 480000, 0, ...AGENTS[1], 0),
  invoice(18, "Sable Point Ventures", "billing@sablepoint.example", "Pitch Materials", "UPSELL", "PAID", 305000, 18, ...AGENTS[2], 3),
  invoice(19, "Redwood Analytics", "accounts@redwoodanalytics.example", "Dashboard UI", "UPSELL", "VIEWED", 890000, 9, ...AGENTS[0], 5),
  invoice(20, "Fernbrook Wellness", "finance@fernbrookwellness.example", "Brand Identity", "FRONT", "PAID", 260000, 22, ...AGENTS[1], 4),
  invoice(21, "Thornbury Publishing", "ap@thornburypublishing.example", "Book Cover Design", "FRONT", "SENT", 135000, 4, ...AGENTS[2], 1),
  invoice(22, "Marigold Events Co", "billing@marigoldevents.example", "Event Branding", "FRONT", "PAID", 340000, 15, ...AGENTS[0], 3),
  invoice(23, "Bramblewood Realty", "accounts@bramblewoodrealty.example", "Listing Templates", "FRONT", "DRAFT", 180000, 1, ...AGENTS[1], 0),
  invoice(24, "Quartzline Energy", "finance@quartzlineenergy.example", "Corporate Site Redesign", "UPSELL", "PAID", 1150000, 28, ...AGENTS[2], 7),
];

export function isFakeInvoiceDataEnabled(): boolean {
  return process.env.USE_FAKE_INVOICE_DATA === "true";
}

export function filterFakeInvoices(searchParams: URLSearchParams): FakeInvoice[] {
  const status = searchParams.get("status");
  const department = searchParams.get("department");
  const agentEmail = searchParams.get("agent");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search")?.toLowerCase();

  return FAKE_INVOICES.filter((inv) => {
    if (status && inv.status !== status) return false;
    if (department && inv.department !== department) return false;
    if (agentEmail && inv.createdByAgentEmail !== agentEmail) return false;
    if (dateFrom && inv.createdAt < new Date(dateFrom)) return false;
    if (dateTo && inv.createdAt > new Date(dateTo + "T23:59:59.999Z")) return false;
    if (
      search &&
      !inv.clientName.toLowerCase().includes(search) &&
      !inv.clientEmail.toLowerCase().includes(search)
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getFakeInvoiceById(id: string): FakeInvoice | undefined {
  return FAKE_INVOICES.find((inv) => inv.id === id);
}
