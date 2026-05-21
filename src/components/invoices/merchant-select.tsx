"use client";

import { CustomSelect } from "@/components/ui/custom-select";

interface MerchantSelectProps {
  value: string;
  onChange: (v: string) => void;
}

const OPTIONS = [
  { value: "STRIPE", label: "Stripe", meta: "Hosted payment page" },
];

export function MerchantSelect({ value, onChange }: MerchantSelectProps) {
  return (
    <CustomSelect
      label="Payment Merchant"
      value={value}
      onChange={onChange}
      options={OPTIONS}
      helper="More merchants coming soon"
    />
  );
}
