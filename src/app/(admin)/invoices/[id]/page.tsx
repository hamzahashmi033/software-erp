import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Calendar,
  Mail,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Building2,
  Tag,
  Receipt,
  StickyNote,
} from "lucide-react";
import { db } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActiveViewerBadge } from "@/components/dashboard/active-viewer-badge";
import { formatCurrency, timeAgo } from "@/lib/invoice-helpers";
import { CopyButton } from "@/components/ui/copy-button";
import type { LineItem } from "@/types/invoice";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      views: { orderBy: { viewedAt: "desc" }, take: 20 },
      _count: { select: { views: true, activeViewers: true } },
    },
  });

  if (!invoice) notFound();

  const items = invoice.items as LineItem[];
  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPrice * 100),
    0
  );
  const taxCents = invoice.taxRate
    ? Math.round(subtotalCents * (invoice.taxRate / 100))
    : 0;

  const stripeUrl = invoice.stripeHostedUrl;
  const isPaid = invoice.status === "PAID";

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Invoice Detail" />
      <main className="flex-1 overflow-y-auto bg-[#F5F3FC]">

        <div className="bg-gradient-to-r from-[#2D1879] to-[#4027C1] px-4 sm:px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/invoices"
              className="mb-5 inline-flex items-center gap-1.5 text-xs text-[#DCC9F7] hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Invoices
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white ring-2 ring-white/20">
                  {invoice.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white leading-tight">
                    {invoice.clientName}
                  </h1>
                  <p className="mt-0.5 text-sm text-[#DCC9F7]">
                    {invoice.clientEmail}
                  </p>
                  {invoice.clientContact && (
                    <p className="text-xs text-[#c3a8f5]">{invoice.clientContact}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#DCC9F7]">
                    Amount Due
                  </p>
                  <p className="text-4xl font-extrabold text-white leading-none mt-1">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <StatusBadge status={invoice.status} />
                  <ActiveViewerBadge invoiceId={id} />
                  <Link
                    href={`/pay/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View as client
                  </Link>
                  {stripeUrl && (
                    <a
                      href={stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#4027C1] shadow hover:bg-[#DCC9F7] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Invoice
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Department",
                  value: invoice.department,
                  icon: Building2,
                },
                {
                  label: "Currency",
                  value: invoice.currency.toUpperCase(),
                  icon: Tag,
                },
                {
                  label: "Views",
                  value: String(invoice._count.views),
                  icon: Eye,
                },
                {
                  label: "Created",
                  value: timeAgo(invoice.createdAt),
                  icon: Clock,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#DCC9F7]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#DCC9F7]">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            <div className="space-y-6 lg:col-span-2">

              <Card>
                <CardHeader
                  title="Invoice Details"
                  description={invoice.packageName ?? undefined}
                />
                <CardContent className="space-y-5">

                  {invoice.descriptionHtml &&
                    invoice.descriptionHtml !== "<p></p>" && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#4027C1]">
                          <FileText className="h-3.5 w-3.5" />
                          Description
                        </p>
                        <div
                          className="rounded-lg bg-[#F5F3FC] px-4 py-3 text-sm text-gray-700 leading-relaxed
                            [&_h2]:font-semibold [&_h2]:text-gray-900
                            [&_h3]:font-semibold [&_h3]:text-gray-900
                            [&_strong]:font-semibold [&_strong]:text-gray-900
                            [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                          dangerouslySetInnerHTML={{ __html: invoice.descriptionHtml }}
                        />
                      </div>
                    )}

                  <div>
                    <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#4027C1]">
                      <Receipt className="h-3.5 w-3.5" />
                      Line Items
                    </p>
                    <div className="rounded-xl border border-[#DCC9F7] overflow-hidden">
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[480px]">
                        <thead className="border-b border-[#ece8f8] bg-[#F5F3FC]">
                          <tr>
                            {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4027C1]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ece8f8] bg-white">
                          {items.map((item, i) => (
                            <tr key={i} className="hover:bg-[#F5F3FC] transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-800">
                                {item.description}
                              </td>
                              <td className="px-4 py-3 text-gray-500">{item.quantity}</td>
                              <td className="px-4 py-3 text-gray-500">
                                {formatCurrency(
                                  Math.round(item.unitPrice * 100),
                                  invoice.currency
                                )}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {formatCurrency(
                                  Math.round(item.quantity * item.unitPrice * 100),
                                  invoice.currency
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        <tfoot className="border-t border-[#DCC9F7] bg-[#F5F3FC]">
                          {invoice.taxRate != null && invoice.taxRate > 0 && (
                            <>
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right text-xs text-gray-500">
                                  Subtotal
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">
                                  {formatCurrency(subtotalCents, invoice.currency)}
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right text-xs text-gray-500">
                                  Tax ({invoice.taxRate}%)
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">
                                  {formatCurrency(taxCents, invoice.currency)}
                                </td>
                              </tr>
                            </>
                          )}
                          <tr className="border-t border-[#DCC9F7]">
                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-[#4027C1]">
                              Total Due
                            </td>
                            <td className="px-4 py-3 text-lg font-extrabold text-[#2D1879]">
                              {formatCurrency(invoice.totalAmount, invoice.currency)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                      </div>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#4027C1]">
                        <StickyNote className="h-3.5 w-3.5" />
                        Notes
                      </p>
                      <div className="rounded-lg border border-[#DCC9F7] bg-amber-50/40 px-4 py-3 text-sm text-gray-700 leading-relaxed">
                        {invoice.notes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="View History"
                  description={`${invoice._count.views} total view${invoice._count.views === 1 ? "" : "s"}`}
                />
                <CardContent>
                  {invoice.views.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                      <Eye className="h-8 w-8 text-[#DCC9F7]" />
                      <p className="text-sm text-gray-400">No views yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invoice.views.map((view) => (
                        <div
                          key={view.id}
                          className="flex items-center justify-between rounded-lg border border-[#ece8f8] bg-[#F5F3FC] px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DCC9F7]">
                              <Eye className="h-3.5 w-3.5 text-[#4027C1]" />
                            </div>
                            <span className="text-xs font-mono text-gray-600">
                              {view.ip ?? "Unknown IP"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {timeAgo(view.viewedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">

              {stripeUrl ? (
                <Card>
                  <CardHeader title="Payment Link" />
                  <CardContent className="space-y-4">
                    {isPaid ? (
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700">
                          Invoice paid
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-[#F5F3FC] px-3 py-2">
                        <p className="break-all text-xs font-mono text-[#4027C1]">
                          {stripeUrl}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={stripeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#4027C1] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#2D1879] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>
                      <CopyButton
                        text={stripeUrl}
                        className="flex-1 justify-center rounded-lg border border-[#DCC9F7] bg-white px-3 py-2.5 font-medium text-[#4027C1] hover:bg-[#F5F3FC]"
                      />
                    </div>

                    {invoice.stripeInvoiceId && (
                      <div className="rounded-lg border border-[#ece8f8] bg-[#F5F3FC] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">
                          Stripe Invoice ID
                        </p>
                        <p className="break-all text-xs font-mono text-gray-500">
                          {invoice.stripeInvoiceId}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader title="Payment Link" />
                  <CardContent>
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3FC]">
                        <Receipt className="h-5 w-5 text-[#DCC9F7]" />
                      </div>
                      <p className="text-sm text-gray-400">
                        No Stripe invoice URL yet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader title="Timeline" />
                <CardContent>
                  <ol className="space-y-0">
                    {(
                      [
                        { label: "Created", date: invoice.createdAt, icon: FileText, always: true },
                        { label: "Sent", date: invoice.sentAt, icon: Mail, always: false },
                        { label: "Due", date: invoice.dueDate, icon: Clock, always: false },
                        { label: "Paid", date: invoice.paidAt, icon: CheckCircle2, always: false },
                      ] as const
                    )
                      .filter((e) => e.always || e.date)
                      .map(({ label, date, icon: Icon }, i, arr) => {
                        const isLast = i === arr.length - 1;
                        const isPaidStep = label === "Paid" && !!date;
                        const dotBg = isPaidStep
                          ? "bg-emerald-500"
                          : isLast
                          ? "bg-[#4027C1]"
                          : "bg-[#DCC9F7]";
                        const iconColor = isPaidStep || isLast
                          ? "text-white"
                          : "text-[#4027C1]";
                        return (
                          <li key={label} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={[
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 ring-white",
                                  dotBg,
                                ].join(" ")}
                              >
                                <Icon className={["h-3.5 w-3.5", iconColor].join(" ")} />
                              </div>
                              {!isLast && (
                                <div className="w-0.5 flex-1 bg-[#ece8f8] my-1" />
                              )}
                            </div>
                            <div className={["pt-1", isLast ? "pb-0" : "pb-5"].join(" ")}>
                              <p className="text-xs font-semibold text-gray-800">{label}</p>
                              <p className="text-xs text-gray-400">
                                {date
                                  ? new Date(date).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Not yet"}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Client" />
                <CardContent className="space-y-3">
                  {[
                    { icon: User, label: "Name", value: invoice.clientName },
                    { icon: Mail, label: "Email", value: invoice.clientEmail },
                    ...(invoice.clientContact
                      ? [{ icon: Building2, label: "Contact", value: invoice.clientContact }]
                      : []),
                    ...(invoice.packageName
                      ? [{ icon: Tag, label: "Package", value: invoice.packageName }]
                      : []),
                    ...(invoice.dueDate
                      ? [
                          {
                            icon: Calendar,
                            label: "Due Date",
                            value: new Date(invoice.dueDate).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }),
                          },
                        ]
                      : []),
                    ...(invoice.taxRate != null && invoice.taxRate > 0
                      ? [{ icon: Receipt, label: "Tax Rate", value: `${invoice.taxRate}%` }]
                      : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F3FC]">
                        <Icon className="h-3.5 w-3.5 text-[#4027C1]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-800">{value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
