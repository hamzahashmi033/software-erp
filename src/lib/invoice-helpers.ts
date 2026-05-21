import { InvoiceStatus } from "@/generated/prisma/enums";

export function formatCurrency(amountInCents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

export function buildPayUrl(invoiceId: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/pay/${invoiceId}`;
}

export function statusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: "Draft",
    SENT: "Sent",
    VIEWED: "Viewed",
    PAID: "Paid",
    VOID: "Void",
    PAYMENT_FAILED: "Failed",
  };
  return labels[status];
}

export function statusColor(
  status: InvoiceStatus
): "green" | "yellow" | "blue" | "gray" | "red" | "orange" {
  const colors: Record<
    InvoiceStatus,
    "green" | "yellow" | "blue" | "gray" | "red" | "orange"
  > = {
    DRAFT: "gray",
    SENT: "yellow",
    VIEWED: "blue",
    PAID: "green",
    VOID: "red",
    PAYMENT_FAILED: "orange",
  };
  return colors[status];
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
