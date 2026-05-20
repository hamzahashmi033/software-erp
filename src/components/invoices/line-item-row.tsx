"use client";

import { Trash2 } from "lucide-react";
import type { LineItem } from "@/lib/validations";
import { formatCurrency } from "@/lib/invoice-helpers";

interface LineItemRowProps {
  item: LineItem;
  index: number;
  onChange: (index: number, item: LineItem) => void;
  onRemove: (index: number) => void;
  removable: boolean;
}

export function LineItemRow({ item, index, onChange, onRemove, removable }: LineItemRowProps) {
  const subtotal = Math.round(item.quantity * item.unitPrice * 100);

  function update(field: keyof LineItem, value: string | number) {
    onChange(index, { ...item, [field]: value });
  }

  return (
    <tr className="border-t border-[#ece8f8]">
      <td className="py-2 pr-3">
        <input
          type="text"
          placeholder="Service or item description"
          value={item.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-md border border-[#DCC9F7] bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#4027C1]"
        />
      </td>
      <td className="py-2 pr-3 w-24">
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => update("quantity", parseFloat(e.target.value) || 1)}
          className="w-full rounded-md border border-[#DCC9F7] bg-white px-3 py-1.5 text-sm text-center text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#4027C1]"
        />
      </td>
      <td className="py-2 pr-3 w-32">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={item.unitPrice}
            onChange={(e) => update("unitPrice", parseFloat(e.target.value) || 0)}
            className="w-full rounded-md border border-[#DCC9F7] bg-white pl-6 pr-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#4027C1]"
          />
        </div>
      </td>
      <td className="py-2 pr-3 w-28 text-right text-sm font-medium text-gray-700">
        {formatCurrency(subtotal)}
      </td>
      <td className="py-2 w-10 text-right">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!removable}
          className="rounded p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-30 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
