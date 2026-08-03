"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  placeholder?: string;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  helper,
  required,
  placeholder = "Select a date…",
}: DatePickerProps) {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const display = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  }

  function clearDate(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  const selParts = value ? value.split("-").map(Number) : null;
  const grid = buildGrid(viewYear, viewMonth);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-800">
          {label}
          {required && <span className="ml-1 text-[#EA580C]">*</span>}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={[
            "w-full flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-left transition-all",
            "focus:outline-none",
            open
              ? "border-[#EA580C] ring-2 ring-[#EA580C]/20"
              : error
              ? "border-red-400"
              : "border-[#FED7AA] hover:border-[#b9a8ef]",
          ].join(" ")}
        >
          <span className={display ? "text-gray-900" : "text-gray-400"}>{display ?? placeholder}</span>
          <span className="flex items-center gap-1 shrink-0">
            {value && (
              <span
                role="button"
                tabIndex={0}
                onClick={clearDate}
                onKeyDown={(e) => e.key === "Enter" && clearDate(e as unknown as React.MouseEvent)}
                className="rounded p-0.5 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <Calendar className="h-4 w-4 text-gray-400" />
          </span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-72 rounded-xl border border-[#FED7AA] bg-white p-3 shadow-xl shadow-[#EA580C]/10">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#FFF7ED] hover:text-[#EA580C]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#FFF7ED] hover:text-[#EA580C]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7">
              {DAY_LABELS.map((d) => (
                <div key={d} className="py-1 text-center text-xs font-medium text-gray-400">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5">
              {grid.map((day, i) => {
                if (day === null) return <div key={i} />;
                const isSelected =
                  selParts !== null &&
                  day === selParts[2] &&
                  viewMonth === selParts[1] - 1 &&
                  viewYear === selParts[0];
                const isToday =
                  day === now.getDate() &&
                  viewMonth === now.getMonth() &&
                  viewYear === now.getFullYear();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={[
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all",
                      isSelected
                        ? "bg-[#EA580C] font-semibold text-white shadow-sm"
                        : isToday
                        ? "border border-[#EA580C] font-semibold text-[#EA580C] hover:bg-[#FFF7ED]"
                        : "text-gray-700 hover:bg-[#FFF7ED] hover:text-[#EA580C]",
                    ].join(" ")}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2 border-t border-[#FFEDD5] pt-3">
              {[
                { label: "+7 days", days: 7 },
                { label: "+14 days", days: 14 },
                { label: "+30 days", days: 30 },
              ].map(({ label, days }) => {
                const d = new Date();
                d.setDate(d.getDate() + days);
                const iso = d.toISOString().split("T")[0];
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => { onChange(iso); setOpen(false); }}
                    className="flex-1 rounded-lg bg-[#FFF7ED] px-2 py-1.5 text-xs font-medium text-[#EA580C] transition-colors hover:bg-[#FFEDD5]"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
    </div>
  );
}
