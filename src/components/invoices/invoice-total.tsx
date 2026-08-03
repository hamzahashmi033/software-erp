import { formatCurrency } from "@/lib/invoice-helpers";

interface InvoiceTotalProps {
  totalCents: number;
  currency?: string;
}

export function InvoiceTotal({ totalCents, currency = "usd" }: InvoiceTotalProps) {
  return (
    <div className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-5 py-3 text-right">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
      <p className="mt-0.5 text-2xl font-bold text-[#7C2D12]">
        {formatCurrency(totalCents, currency)}
      </p>
    </div>
  );
}
