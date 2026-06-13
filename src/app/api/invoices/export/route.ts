import { db } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import type { InvoiceStatus } from "@/generated/prisma/enums";

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("statusFilter"); // "all" | "paid" | "unpaid"
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const agent = searchParams.get("agent");
  const department = searchParams.get("department");

  let statusWhere: object = {};
  if (statusFilter === "paid") {
    statusWhere = { status: "PAID" as InvoiceStatus };
  } else if (statusFilter === "unpaid") {
    statusWhere = { status: { notIn: ["PAID", "VOID"] as InvoiceStatus[] } };
  }

  const where = {
    ...statusWhere,
    ...(department ? { department: department as "FRONT" | "UPSELL" } : {}),
    ...(agent ? { createdByAgentEmail: agent } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo + "T23:59:59.999Z") } : {}),
          },
        }
      : {}),
  };

  const invoices = await db.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Invoice ID",
    "Client Name",
    "Client Email",
    "Client Contact",
    "Package",
    "Department",
    "Status",
    "Amount",
    "Currency",
    "Created By",
    "Agent Email",
    "Created At",
    "Sent At",
    "Paid At",
    "Due Date",
  ];

  const rows = invoices.map((inv) => [
    escapeCSV(inv.id),
    escapeCSV(inv.clientName),
    escapeCSV(inv.clientEmail),
    escapeCSV(inv.clientContact),
    escapeCSV(inv.packageName),
    escapeCSV(inv.department),
    escapeCSV(inv.status),
    escapeCSV(formatAmount(inv.totalAmount, inv.currency)),
    escapeCSV(inv.currency.toUpperCase()),
    escapeCSV(inv.createdByAgent),
    escapeCSV(inv.createdByAgentEmail),
    escapeCSV(inv.createdAt.toISOString()),
    escapeCSV(inv.sentAt?.toISOString()),
    escapeCSV(inv.paidAt?.toISOString()),
    escapeCSV(inv.dueDate?.toISOString()),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  const label =
    statusFilter === "paid"
      ? "paid-invoices"
      : statusFilter === "unpaid"
      ? "unpaid-invoices"
      : "all-invoices";

  const dateSuffix =
    dateFrom && dateTo
      ? `_${dateFrom}_to_${dateTo}`
      : dateFrom
      ? `_from_${dateFrom}`
      : dateTo
      ? `_to_${dateTo}`
      : "";

  const filename = `${label}${dateSuffix}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
