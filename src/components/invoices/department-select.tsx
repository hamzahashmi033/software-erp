"use client";

import { CustomSelect } from "@/components/ui/custom-select";

interface DepartmentSelectProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const OPTIONS = [
  { value: "FRONT", label: "Front", meta: "New client acquisition" },
  { value: "UPSELL", label: "Upsell", meta: "Existing client upgrade" },
];

export function DepartmentSelect({ value, onChange, error }: DepartmentSelectProps) {
  return (
    <CustomSelect
      label="Type (Internal)"
      required
      value={value}
      onChange={onChange}
      options={OPTIONS}
      placeholder="Select type…"
      error={error}
      helper="Not visible to the client"
    />
  );
}
