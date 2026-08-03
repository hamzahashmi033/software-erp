"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = getPageNumbers(page, totalPages);

  const btnBase =
    "flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-sm font-medium transition-all";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#FFEDD5] px-5 py-4 sm:flex-row">
      <p className="text-xs text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-600">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-600">{total}</span> invoices
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} gap-1 pl-2.5 pr-3 text-gray-500 hover:bg-[#FFF7ED] hover:text-[#EA580C] disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={[
                  btnBase,
                  "w-8",
                  p === page
                    ? "bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/30"
                    : "text-gray-600 hover:bg-[#FFF7ED] hover:text-[#EA580C]",
                ].join(" ")}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} gap-1 pl-3 pr-2.5 text-gray-500 hover:bg-[#FFF7ED] hover:text-[#EA580C] disabled:cursor-not-allowed disabled:opacity-30`}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
