"use client";

import { Select } from "@/components/ui/select";

interface CurrencySelectProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function CurrencySelect({ value, onChange, error }: CurrencySelectProps) {
  return (
    <Select
      label="Currency"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      options={[
        { value: "usd", label: "USD — US Dollar" },
        { value: "eur", label: "EUR — Euro" },
        { value: "gbp", label: "GBP — British Pound" },
        { value: "aed", label: "AED — UAE Dirham" },
        { value: "pkr", label: "PKR — Pakistani Rupee" },
        { value: "cad", label: "CAD — Canadian Dollar" },
        { value: "aud", label: "AUD — Australian Dollar" },
      ]}
    />
  );
}
