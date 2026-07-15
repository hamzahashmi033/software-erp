"use client";

import type { InvoiceResult } from "@/components/invoices/invoice-form";

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function invoiceNumber(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

interface Props {
  invoice: InvoiceResult;
  onCreateAnother: () => void;
}

interface RowProps {
  label: string;
  value: React.ReactNode;
}

function Row({ label, value }: RowProps) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-6 text-sm font-semibold text-gray-700 w-44 align-top">{label}</td>
      <td className="py-3 text-sm text-gray-800 align-top">{value}</td>
    </tr>
  );
}

export function AgentInvoiceSuccess({ invoice, onCreateAnother }: Props) {
  const payUrl = invoice.stripeHostedUrl ?? `/pay/${invoice.id}`;
  const date = new Date(invoice.createdAt).toLocaleDateString("en-US", { dateStyle: "long" });
  const amount = fmt(invoice.totalAmount, invoice.currency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1879] via-[#3d22a0] to-[#1a0d4a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">

        <div className="bg-[#2D1879] px-8 py-6 flex items-center justify-center">
          <img src="/logo-v2-1.png" alt="Leen Design Studios" className="h-16 w-auto object-contain brightness-0 invert" />
        </div>

        <div className="bg-white px-8 py-8">
          <h1 className="text-xl font-bold text-[#4027C1] mb-4">Your Invoice is Ready!</h1>

          <p className="text-sm text-gray-800 mb-1">
            Dear <strong>{invoice.clientName}</strong>,
          </p>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Thank you for choosing <strong>Leen Design Studios</strong>. Here&apos;s a summary of your invoice
            details. Please review the information below and proceed with the payment.
          </p>

          <h2 className="text-base font-bold text-[#4027C1] mb-3">Invoice Summary</h2>
          <table className="w-full mb-8 border-t border-gray-100">
            <tbody>
              <Row label="Customer Name:" value={invoice.clientName} />
              <Row label="Customer Email:" value={invoice.clientEmail} />
              {invoice.clientContact && (
                <Row label="Customer Contact:" value={invoice.clientContact} />
              )}
              <Row label="Invoice Number:" value={invoiceNumber(invoice.id)} />
              <Row label="Invoice Date:" value={date} />
              <Row label="Total Amount:" value={<span className="font-semibold">{amount}</span>} />
            </tbody>
          </table>

          <h2 className="text-base font-bold text-[#4027C1] mb-3">Package Details</h2>
          <table className="w-full mb-8 border-t border-gray-100">
            <tbody>
              {invoice.packageName && (
                <Row label="Package Name:" value={invoice.packageName} />
              )}
              <Row
                label="Package Description:"
                value={
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: invoice.descriptionHtml }}
                  />
                }
              />
            </tbody>
          </table>

          {invoice.createdByAgent && (
            <div className="mb-6 rounded-lg border border-[#EDE9FB] bg-[#F5F3FC] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#4027C1] mb-0.5">Agent</p>
              <p className="text-sm font-semibold text-gray-900">{invoice.createdByAgent}</p>
              {invoice.createdByAgentEmail && (
                <a href={`mailto:${invoice.createdByAgentEmail}`} className="text-xs text-[#4027C1]">
                  {invoice.createdByAgentEmail}
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <a
              href={payUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full max-w-xs text-center rounded-lg bg-[#4027C1] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2D1879] transition-colors"
            >
              Pay Invoice
            </a>
            <button
              onClick={onCreateAnother}
              className="text-sm text-gray-400 hover:text-[#4027C1] transition-colors"
            >
              Create another invoice
            </button>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 text-center">
          <p className="text-xs text-gray-500">
            Need assistance? Reach out to us at{" "}
            <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "info@leendesignstudios.com"}`} className="font-semibold text-gray-700">
              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "info@leendesignstudios.com"}
            </a>
          </p>
          <p className="text-xs text-gray-500">
            <a href={'https://leendesignstudio.com/terms-conditions/'} target="_blank" className="font-semibold text-gray-700">
              Terms & Condtitions
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            &copy; {new Date().getFullYear()} <strong className="text-gray-500">Leen Design Studios</strong>. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
