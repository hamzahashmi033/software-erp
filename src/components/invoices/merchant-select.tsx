"use client";

import { Select } from "@/components/ui/select";

interface MerchantSelectProps {
  value: string;
  onChange: (v: string) => void;
}

export function MerchantSelect({ value, onChange }: MerchantSelectProps) {
  return (
    <Select
      label="Payment Merchant"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={[{ value: "STRIPE", label: "Stripe" }]}
      helper="More merchants coming soon"
    />
  );
}
