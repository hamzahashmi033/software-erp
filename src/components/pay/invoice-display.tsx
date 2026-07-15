import { InvoiceLineItemsTable } from "./invoice-line-items-table";
import { formatCurrency } from "@/lib/invoice-helpers";
import type { LineItem } from "@/types/invoice";

interface InvoiceDisplayProps {
  invoiceId: string;
  clientName: string;
  clientEmail: string;
  clientContact?: string | null;
  packageName?: string | null;
  descriptionHtml: string;
  items: LineItem[];
  currency: string;
  totalAmount: number;
  fromName: string;
  createdAt: Date | string;
  isPaid: boolean;
}

export function InvoiceDisplay({
  invoiceId,
  clientName,
  clientEmail,
  clientContact,
  packageName,
  descriptionHtml,
  items,
  currency,
  totalAmount,
  fromName,
  createdAt,
  isPaid,
}: InvoiceDisplayProps) {
  const invoiceNumber = invoiceId.replace(/-/g, "").slice(0, 8).toUpperCase();

  const dateIssued = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-6">
        <div>
          <p className="text-xl font-bold text-gray-900">{fromName}</p>
          {packageName && (
            <p className="mt-1 text-sm text-gray-500">{packageName}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Invoice
          </p>
          <p className="mt-0.5 text-sm font-semibold text-gray-700">
            #{invoiceNumber}
          </p>
          <p className="mt-1 text-xs text-gray-400">{dateIssued}</p>
        </div>
      </div>

      <div className="mx-8 mb-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Amount due
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {formatCurrency(totalAmount, currency)}
            </p>
          </div>
          {isPaid ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              Paid
            </span>
          ) : (
            <a
              href="#payment-form"
              className="inline-flex items-center rounded-lg bg-[#4027C1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2D1879]"
            >
              Pay now
            </a>
          )}
        </div>
      </div>

      <div className="px-8 pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Bill to
        </p>
        <p className="text-sm font-semibold text-gray-900">{clientName}</p>
        <p className="text-sm text-gray-500">{clientEmail}</p>
        {clientContact && (
          <p className="text-sm text-gray-500">{clientContact}</p>
        )}
      </div>

      {descriptionHtml && descriptionHtml !== "<p></p>" && (
        <div className="border-t border-gray-100 px-8 py-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Notes
          </p>
          <div
            className="prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>
      )}

      <div className="border-t border-gray-100">
        <InvoiceLineItemsTable items={items} currency={currency} />
      </div>
    </div>
  );
}
