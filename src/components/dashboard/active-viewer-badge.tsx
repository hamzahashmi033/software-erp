"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface ActiveViewerBadgeProps {
  invoiceId: string;
}

export function ActiveViewerBadge({ invoiceId }: ActiveViewerBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch(`/api/pay/${invoiceId}/heartbeat`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setCount(data.count ?? 0);
      } catch {
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [invoiceId]);

  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Eye className="h-3 w-3" />
      {count} live
    </span>
  );
}
