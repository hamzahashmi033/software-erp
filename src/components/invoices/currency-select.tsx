"use client";

import { CustomSelect } from "@/components/ui/custom-select";

interface CurrencySelectProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const OPTIONS = [
  { value: "usd", label: "USD", meta: "US Dollar" },
  { value: "eur", label: "EUR", meta: "Euro" },
  { value: "gbp", label: "GBP", meta: "British Pound" },
  { value: "aed", label: "AED", meta: "UAE Dirham" },
  { value: "pkr", label: "PKR", meta: "Pakistani Rupee" },
  { value: "cad", label: "CAD", meta: "Canadian Dollar" },
  { value: "aud", label: "AUD", meta: "Australian Dollar" },
];

export function CurrencySelect({ value, onChange, error }: CurrencySelectProps) {
  return (
    <CustomSelect
      label="Currency"
      required
      value={value}
      onChange={onChange}
      options={OPTIONS}
      error={error}
    />
  );
}
