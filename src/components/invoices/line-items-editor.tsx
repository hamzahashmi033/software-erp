"use client";

import { PlusCircle } from "lucide-react";
import { LineItemRow } from "./line-item-row";
import { InvoiceTotal } from "./invoice-total";
import type { LineItem } from "@/lib/validations";

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  error?: string;
}

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unitPrice: 0 });

export function LineItemsEditor({ items, onChange, error }: LineItemsEditorProps) {
  const totalCents = Math.round(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100
  );

  function handleChange(index: number, item: LineItem) {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-[#DCC9F7]">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[#ece8f8] bg-[#F5F3FC]">
              {["Description", "Qty", "Unit Price", "Subtotal", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#4027C1]">
                  {h}
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
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start justify-between">
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem()])}
          className="flex items-center gap-2 text-sm text-[#4027C1] hover:text-[#2D1879] transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add line item
        </button>
        <InvoiceTotal totalCents={totalCents} />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
