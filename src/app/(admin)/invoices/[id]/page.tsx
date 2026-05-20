import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Calendar,
  Mail,
  Building2,
} from "lucide-react";
import { db } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActiveViewerBadge } from "@/components/dashboard/active-viewer-badge";
import { formatCurrency, buildPayUrl, timeAgo } from "@/lib/invoice-helpers";
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
  const payUrl = buildPayUrl(id);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Invoice Detail" />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {/* Back + header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h2 className="text-xl font-semibold text-slate-100">
                  {invoice.clientName}
                </h2>
                <p className="text-sm text-slate-500">{invoice.clientEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={invoice.status} />
              <ActiveViewerBadge invoiceId={id} />
              <a
                href={payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View as client
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main */}
            <div className="space-y-6 lg:col-span-2">
              {/* Details */}
              <Card>
                <CardHeader title="Invoice Details" />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Amount</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-100">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Department</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-200">
                        {invoice.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Merchant</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-200">
                        {invoice.paymentMerchant}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {invoice.descriptionHtml && invoice.descriptionHtml !== "<p></p>" && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Description</p>
                      <div
                        className="prose-sm text-slate-300 leading-relaxed [&_h2]:text-slate-100 [&_h3]:text-slate-100 [&_strong]:text-slate-100"
                        dangerouslySetInnerHTML={{ __html: invoice.descriptionHtml }}
                      />
                    </div>
                  )}

                  {/* Line items */}
                  <div>
                    <p className="text-xs text-slate-500 mb-3">Line Items</p>
                    <div className="overflow-hidden rounded-lg border border-slate-700">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-700 bg-slate-800/50">
                          <tr>
                            {["Description", "Qty", "Price", "Amount"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <tr key={i} className="border-t border-slate-800">
                              <td className="px-3 py-2 text-slate-300">{item.description}</td>
                              <td className="px-3 py-2 text-slate-400">{item.quantity}</td>
                              <td className="px-3 py-2 text-slate-400">
                                {formatCurrency(Math.round(item.unitPrice * 100), invoice.currency)}
                              </td>
                              <td className="px-3 py-2 font-medium text-slate-200">
                                {formatCurrency(Math.round(item.quantity * item.unitPrice * 100), invoice.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* View log */}
              <Card>
                <CardHeader
                  title="View History"
                  description={`${invoice._count.views} total views`}
                />
                <CardContent>
                  {invoice.views.length === 0 ? (
                    <p className="text-sm text-slate-500">No views yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {invoice.views.map((view) => (
                        <div
                          key={view.id}
                          className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-xs font-mono text-slate-400">
                              {view.ip ?? "Unknown IP"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {timeAgo(view.viewedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader title="Timeline" />
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Created",
                        date: invoice.createdAt,
                        icon: Calendar,
                        always: true,
                      },
                      {
                        label: "Sent",
                        date: invoice.sentAt,
                        icon: Mail,
                        always: false,
                      },
                      {
                        label: "Paid",
                        date: invoice.paidAt,
                        icon: Building2,
                        always: false,
                      },
                    ]
                      .filter((e) => e.always || e.date)
                      .map(({ label, date, icon: Icon }) => (
                        <div key={label} className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-md bg-slate-800 p-1.5">
                            <Icon className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-300">
                              {label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {date
                                ? new Date(date).toLocaleString()
                                : "Not yet"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Payment Link" />
                <CardContent>
                  <div className="rounded-lg bg-slate-800/50 px-3 py-2">
                    <p className="break-all text-xs font-mono text-indigo-400">
                      {payUrl}
                    </p>
                  </div>
                  <CopyButton text={payUrl} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
