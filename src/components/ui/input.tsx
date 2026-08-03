"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-800">
          {label}
          {props.required && <span className="ml-1 text-[#EA580C]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "w-full rounded-lg border border-[#FED7AA] bg-white px-3 py-2 text-sm text-gray-900",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50",
          error ? "border-red-400 focus:ring-red-400" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
    </div>
  );
}
