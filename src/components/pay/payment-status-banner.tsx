"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "idle" | "processing" | "success" | "error";

interface PaymentStatusBannerProps {
  status: Status;
  message?: string;
}

export function PaymentStatusBanner({ status, message }: PaymentStatusBannerProps) {
  if (status === "idle") return null;

  const styles: Record<Exclude<Status, "idle">, string> = {
    processing: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };

  const icons: Record<Exclude<Status, "idle">, React.ReactNode> = {
    processing: <Loader2 className="h-4 w-4 animate-spin" />,
    success: <CheckCircle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
  };

  const defaults: Record<Exclude<Status, "idle">, string> = {
    processing: "Processing payment...",
    success: "Payment successful! Thank you.",
    error: "Payment failed. Please try again.",
  };

  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium",
        styles[status as Exclude<Status, "idle">],
      ].join(" ")}
    >
      {icons[status as Exclude<Status, "idle">]}
      {message ?? defaults[status as Exclude<Status, "idle">]}
    </div>
  );
}
