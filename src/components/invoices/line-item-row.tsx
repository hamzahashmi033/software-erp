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
  currency?: string;
}

const inputBase =
  "w-full rounded-lg border border-[#DCC9F7] bg-white text-sm text-gray-900 placeholder:text-gray-400 " +
  "focus:outline-none focus:border-[#4027C1] focus:ring-2 focus:ring-[#4027C1]/20 transition-all";

export function LineItemRow({ item, index, onChange, onRemove, removable, currency = "usd" }: LineItemRowProps) {
  const subtotal = Math.round(item.quantity * item.unitPrice * 100);

  function update(field: keyof LineItem, value: string | number) {
    onChange(index, { ...item, [field]: value });
  }

  return (
    <tr className="group border-t border-[#ece8f8] hover:bg-[#faf9ff] transition-colors">
      {/* Description */}
      <td className="px-3 py-2.5">
        <input
          type="text"
          placeholder="Service or item description"
          value={item.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputBase} px-3 py-1.5`}
        />
      </td>

      {/* Qty */}
      <td className="px-3 py-2.5 w-[90px]">
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => update("quantity", parseFloat(e.target.value) || 1)}
          className={`${inputBase} px-2 py-1.5 text-center`}
        />
      </td>

      {/* Unit Price */}
      <td className="px-3 py-2.5 w-[130px]">
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
            {currency === "usd" ? "$" : currency === "eur" ? "€" : currency === "gbp" ? "£" : ""}
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={item.unitPrice}
            onChange={(e) => update("unitPrice", parseFloat(e.target.value) || 0)}
            className={`${inputBase} py-1.5 pr-3 ${["usd","eur","gbp"].includes(currency) ? "pl-6" : "pl-3"}`}
          />
        </div>
      </td>

      {/* Subtotal */}
      <td className="px-3 py-2.5 w-[110px] text-right">
        <span className="text-sm font-semibold text-[#2D1879]">
          {formatCurrency(subtotal, currency)}
        </span>
      </td>

      {/* Remove */}
      <td className="py-2.5 pr-3 w-10 text-center">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!removable}
          className="rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-0 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
