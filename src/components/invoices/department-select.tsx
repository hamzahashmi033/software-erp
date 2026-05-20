"use client";

import { Select } from "@/components/ui/select";

interface DepartmentSelectProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function DepartmentSelect({ value, onChange, error }: DepartmentSelectProps) {
  return (
    <Select
      label="Type (Internal)"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      helper="Not visible to the client"
      options={[
        { value: "", label: "Select department..." },
        { value: "FRONT", label: "Front" },
        { value: "UPSELL", label: "Upsell" },
      ]}
    />
  );
}
