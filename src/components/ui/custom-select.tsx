"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  meta?: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  error,
  helper,
  required,
  disabled,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
  }

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-800">
          {label}
          {required && <span className="ml-1 text-[#4027C1]">*</span>}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={[
            "w-full flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-left transition-all",
            "focus:outline-none focus:ring-2 focus:ring-[#4027C1]/30",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            open
              ? "border-[#4027C1] ring-2 ring-[#4027C1]/20"
              : error
              ? "border-red-400"
              : "border-[#DCC9F7] hover:border-[#b9a8ef]",
          ].join(" ")}
        >
          <span className={selected?.value ? "text-gray-900" : "text-gray-400"}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#DCC9F7] bg-white shadow-xl shadow-[#4027C1]/10"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={[
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-left transition-colors",
                    isSelected
                      ? "bg-[#F5F3FC] text-[#4027C1]"
                      : "text-gray-700 hover:bg-[#F5F3FC] hover:text-[#4027C1]",
                  ].join(" ")}
                >
                  <div>
                    <span className={isSelected ? "font-medium" : ""}>{opt.label}</span>
                    {opt.meta && (
                      <span className="ml-1.5 text-xs text-gray-400">{opt.meta}</span>
                    )}
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#4027C1]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
    </div>
  );
}
