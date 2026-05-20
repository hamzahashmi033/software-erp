import { formatCurrency } from "@/lib/invoice-helpers";

interface InvoiceTotalProps {
  totalCents: number;
  currency?: string;
}

export function InvoiceTotal({ totalCents, currency = "usd" }: InvoiceTotalProps) {
  return (
    <div className="rounded-lg border border-[#DCC9F7] bg-[#F5F3FC] px-5 py-3 text-right">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
      <p className="mt-0.5 text-2xl font-bold text-[#2D1879]">
        {formatCurrency(totalCents, currency)}
      </p>
    </div>
  );
}
