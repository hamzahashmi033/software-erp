import { notFound } from "next/navigation";
import { CheckCircle2, Calendar, Receipt, FileText, User } from "lucide-react";
import { db } from "@/lib/prisma";
import { ViewerTracker } from "@/components/pay/viewer-tracker";
import { formatCurrency } from "@/lib/invoice-helpers";
import type { LineItem } from "@/types/invoice";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({ where: { id } });

  if (!invoice || invoice.status === "DRAFT" || invoice.status === "VOID") {
    notFound();
  }

  const items = invoice.items as LineItem[];
  const fromName = process.env.FROM_NAME ?? "Invoice";
  const isPaid = invoice.status === "PAID";

  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPrice * 100),
    0
  );
  const taxCents = invoice.taxRate
    ? Math.round(subtotalCents * (invoice.taxRate / 100))
    : 0;

  const issuedDate = new Date(invoice.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <ViewerTracker invoiceId={id} />

      <article className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#4027C1]/10 ring-1 ring-[#DCC9F7]">

        {/* ── Paid banner ───────────────────────────────────────────── */}
        {isPaid && (
          <div className="flex items-center justify-center gap-2 bg-emerald-500 px-6 py-3">
            <CheckCircle2 className="h-4 w-4 text-white" />
            <p className="text-sm font-semibold text-white">
              This invoice has been paid — thank you!
            </p>
          </div>
        )}

        {/* ── Invoice header ────────────────────────────────────────── */}
        <header className="bg-gradient-to-r from-[#2D1879] to-[#4027C1] px-8 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#DCC9F7] mb-1">
                {fromName}
              </p>
              <h1 className="text-2xl font-bold text-white">Invoice</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#DCC9F7] mb-1">Amount Due</p>
              <p className="text-3xl font-extrabold text-white">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
            </div>
          </div>

          {/* meta chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs text-white">
              <FileText className="h-3 w-3" />
              Issued {issuedDate}
            </span>
            {dueDate && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs text-white">
                <Calendar className="h-3 w-3" />
                Due {dueDate}
              </span>
            )}
            {invoice.currency && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase text-white">
                {invoice.currency}
              </span>
            )}
          </div>
        </header>

        <div className="px-8 py-8 space-y-8">

          {/* ── Bill To ───────────────────────────────────────────────── */}
          <section aria-label="Bill to">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#4027C1]">
              <User className="h-3.5 w-3.5" />
              Bill To
            </h2>
            <address className="not-italic rounded-xl bg-[#F5F3FC] px-5 py-4 border border-[#EDE9FB]">
              <p className="font-semibold text-gray-900">{invoice.clientName}</p>
              <a
                href={`mailto:${invoice.clientEmail}`}
                className="text-sm text-[#4027C1] hover:underline"
              >
                {invoice.clientEmail}
              </a>
              {invoice.clientContact && (
                <p className="mt-0.5 text-sm text-gray-500">{invoice.clientContact}</p>
              )}
            </address>
          </section>

          {/* ── Description ───────────────────────────────────────────── */}
          {invoice.descriptionHtml && invoice.descriptionHtml !== "<p></p>" && (
            <section aria-label="Description">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#4027C1]">
                <FileText className="h-3.5 w-3.5" />
                {invoice.packageName ?? "Description"}
              </h2>
              <div
                className="rounded-xl bg-[#F5F3FC] px-5 py-4 border border-[#EDE9FB] text-sm text-gray-700 leading-relaxed
                  [&_h2]:font-semibold [&_h2]:text-gray-900
                  [&_strong]:font-semibold
                  [&_ul]:list-disc [&_ul]:pl-4
                  [&_ol]:list-decimal [&_ol]:pl-4"
                dangerouslySetInnerHTML={{ __html: invoice.descriptionHtml }}
              />
            </section>
          )}

          {/* ── Line items ────────────────────────────────────────────── */}
          <section aria-label="Line items">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#4027C1]">
              <Receipt className="h-3.5 w-3.5" />
              Items
            </h2>
            <div className="rounded-xl border border-[#DCC9F7] overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[440px]">
                <thead className="border-b border-[#EDE9FB] bg-[#F5F3FC]">
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
                <tbody className="divide-y divide-[#EDE9FB]">
                  {items.map((item, i) => (
                    <tr key={i} className="bg-white">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatCurrency(Math.round(item.unitPrice * 100), invoice.currency)}
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
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {formatCurrency(subtotalCents, invoice.currency)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right text-xs text-gray-500">
                          Tax ({invoice.taxRate}%)
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {formatCurrency(taxCents, invoice.currency)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="border-t border-[#DCC9F7]">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-[#4027C1]">
                      Total Due
                    </td>
                    <td className="px-4 py-3 text-xl font-extrabold text-[#2D1879]">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
          </section>

          {/* ── Notes ─────────────────────────────────────────────────── */}
          {invoice.notes && (
            <section aria-label="Notes">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#4027C1]">
                Notes
              </h2>
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-gray-700 leading-relaxed">
                {invoice.notes}
              </p>
            </section>
          )}

          {/* ── CTA ───────────────────────────────────────────────────── */}
          {isPaid ? (
            <div className="flex items-center justify-center gap-3 rounded-xl bg-emerald-50 px-6 py-5 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold text-emerald-800">Payment complete</p>
                <p className="text-sm text-emerald-600">
                  Paid{" "}
                  {invoice.paidAt
                    ? new Date(invoice.paidAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </div>
          ) : invoice.stripeHostedUrl ? (
            <div className="space-y-3">
              <a
                href={invoice.stripeHostedUrl}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2D1879] to-[#4027C1] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#4027C1]/30 hover:from-[#230f65] hover:to-[#2D1879] transition-all"
              >
                Pay Now &nbsp;·&nbsp; {formatCurrency(invoice.totalAmount, invoice.currency)}
              </a>
              <p className="text-center text-xs text-gray-400">
                You will be redirected to Stripe's secure payment page
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400">
              Payment link is not available yet — please contact us.
            </p>
          )}
        </div>
      </article>
    </>
  );
}
