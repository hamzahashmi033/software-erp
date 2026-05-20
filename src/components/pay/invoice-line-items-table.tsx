import { formatCurrency } from "@/lib/invoice-helpers";
import type { LineItem } from "@/types/invoice";

interface InvoiceLineItemsTableProps {
  items: LineItem[];
  currency: string;
}

export function InvoiceLineItemsTable({ items, currency }: InvoiceLineItemsTableProps) {
  const total = Math.round(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <tr key={i}>
              <td className="px-4 py-3 text-slate-800">{item.description}</td>
              <td className="px-4 py-3 text-slate-500">{item.quantity}</td>
              <td className="px-4 py-3 text-slate-500">
                {formatCurrency(Math.round(item.unitPrice * 100), currency)}
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {formatCurrency(Math.round(item.quantity * item.unitPrice * 100), currency)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-50">
          <tr>
            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-slate-600">
              Total
            </td>
            <td className="px-4 py-3 text-lg font-bold text-slate-900">
              {formatCurrency(total, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
