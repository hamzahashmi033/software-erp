import type { InvoiceStatus } from "@/types/invoice";
import { statusLabel, statusColor } from "@/lib/invoice-helpers";

const colorStyles = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  gray: "bg-gray-100 text-gray-600 ring-gray-200",
  red: "bg-red-50 text-red-600 ring-red-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
};

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColor(status);
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        colorStyles[color],
      ].join(" ")}
    >
      {statusLabel(status)}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "yellow" | "blue" | "gray" | "red" | "orange" | "purple";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  if (variant === "purple") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#FED7AA] px-2.5 py-0.5 text-xs font-medium text-[#7C2D12] ring-1 ring-inset ring-[#EA580C]/20">
        {children}
      </span>
    );
  }
  const color = variant === "default" ? "gray" : variant;
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        colorStyles[color as keyof typeof colorStyles],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
