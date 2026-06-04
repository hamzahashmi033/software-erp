"use client";

import { PlusCircle } from "lucide-react";
import { LineItemRow } from "./line-item-row";
import { formatCurrency } from "@/lib/invoice-helpers";
import type { LineItem } from "@/lib/validations";

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency?: string;
  taxRate?: number;
  error?: string;
}

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unitPrice: 0 });

export function LineItemsEditor({
  items,
  onChange,
  currency = "usd",
  taxRate,
  error,
}: LineItemsEditorProps) {
  const subtotalCents = Math.round(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100
  );
  const taxCents = taxRate ? Math.round(subtotalCents * (taxRate / 100)) : 0;
  const totalCents = subtotalCents + taxCents;

  function handleChange(index: number, item: LineItem) {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#DCC9F7] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed">
          <colgroup>
            <col />
            <col className="w-[90px]" />
            <col className="w-[130px]" />
            <col className="w-[110px]" />
            <col className="w-10" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#ece8f8] bg-[#F5F3FC]">
              {[
                { label: "Description", align: "text-left" },
                { label: "Qty", align: "text-center" },
                { label: "Unit Price", align: "text-left" },
                { label: "Amount", align: "text-right" },
                { label: "", align: "" },
              ].map((h) => (
                <th
                  key={h.label}
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#4027C1] ${h.align}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item, i) => (
              <LineItemRow
                key={i}
                item={item}
                index={i}
                onChange={handleChange}
                onRemove={handleRemove}
                removable={items.length > 1}
                currency={currency}
              />
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Footer row: add button + totals */}
      <div className="flex items-end justify-between gap-4">
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem()])}
          className="flex items-center gap-2 rounded-lg border border-dashed border-[#DCC9F7] px-4 py-2 text-sm text-[#4027C1] transition-colors hover:border-[#4027C1] hover:bg-[#F5F3FC]"
        >
          <PlusCircle className="h-4 w-4" />
          Add line item
        </button>

        <div className="min-w-[220px] rounded-xl border border-[#DCC9F7] bg-[#F5F3FC] px-5 py-3 text-right">
          {taxRate && taxRate > 0 ? (
            <>
              <div className="mb-1 flex items-center justify-between gap-6 text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotalCents, currency)}</span>
              </div>
              <div className="mb-2.5 flex items-center justify-between gap-6 text-sm text-gray-500">
                <span>Tax ({taxRate}%)</span>
                <span>{formatCurrency(taxCents, currency)}</span>
              </div>
              <div className="border-t border-[#DCC9F7] pt-2.5">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total</span>
                  <span className="text-xl font-extrabold text-[#2D1879]">
                    {formatCurrency(totalCents, currency)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total</span>
              <span className="text-xl font-extrabold text-[#2D1879]">
                {formatCurrency(totalCents, currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
