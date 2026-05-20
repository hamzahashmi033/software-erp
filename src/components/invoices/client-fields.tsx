"use client";

import { Input } from "@/components/ui/input";

interface ClientFieldsProps {
  clientName: string;
  clientEmail: string;
  clientContact: string;
  onClientNameChange: (v: string) => void;
  onClientEmailChange: (v: string) => void;
  onClientContactChange: (v: string) => void;
  errors?: { clientName?: string; clientEmail?: string; clientContact?: string };
}

export function ClientFields({
  clientName,
  clientEmail,
  clientContact,
  onClientNameChange,
  onClientEmailChange,
  onClientContactChange,
  errors,
}: ClientFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        label="Customer Name"
        placeholder="Enter Name"
        required
        value={clientName}
        onChange={(e) => onClientNameChange(e.target.value)}
        error={errors?.clientName}
      />
      <Input
        label="Customer Email"
        type="email"
        placeholder="Enter Email"
        required
        value={clientEmail}
        onChange={(e) => onClientEmailChange(e.target.value)}
        error={errors?.clientEmail}
      />
      <Input
        label="Customer Contact"
        type="tel"
        placeholder="Enter Contact"
        required
        value={clientContact}
        onChange={(e) => onClientContactChange(e.target.value)}
        error={errors?.clientContact}
      />
    </div>
  );
}
