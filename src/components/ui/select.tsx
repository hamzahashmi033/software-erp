"use client";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
}

export function Select({ label, error, helper, id, options, className = "", ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-800">
          {label}
          {props.required && <span className="ml-1 text-[#EA580C]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={[
          "w-full rounded-lg border border-[#FED7AA] bg-white px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error ? "border-red-400 focus:ring-red-400" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
    </div>
  );
}
