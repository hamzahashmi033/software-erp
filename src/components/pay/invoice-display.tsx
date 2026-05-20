import { InvoiceLineItemsTable } from "./invoice-line-items-table";
import type { LineItem } from "@/types/invoice";

interface InvoiceDisplayProps {
  clientName: string;
  clientEmail: string;
  descriptionHtml: string;
  items: LineItem[];
  currency: string;
  fromName: string;
  createdAt: Date | string;
}

export function InvoiceDisplay({
  clientName,
  clientEmail,
  descriptionHtml,
  items,
  currency,
  fromName,
  createdAt,
}: InvoiceDisplayProps) {
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{fromName}</h1>
          <p className="mt-1 text-sm text-slate-500">Invoice</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Issued</p>
          <p className="text-sm font-medium text-slate-700">{date}</p>
        </div>
      </div>

      {/* Bill to */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Bill To
        </p>
        <p className="mt-1 font-medium text-slate-800">{clientName}</p>
        <p className="text-sm text-slate-500">{clientEmail}</p>
      </div>

      {/* Description */}
      {descriptionHtml && descriptionHtml !== "<p></p>" && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>
      )}

      {/* Line items */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Items
        </p>
        <InvoiceLineItemsTable items={items} currency={currency} />
      </div>
    </div>
  );
}
