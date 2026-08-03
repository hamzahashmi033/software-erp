"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createDealSchema, PIPELINE_STAGE_VALUES } from "@/lib/validations/crm";
import { pipelineStageLabel } from "@/lib/crm-helpers";

interface Option {
  id: string;
  name: string;
}

export function DealForm() {
  const router = useRouter();
  const [staff, setStaff] = useState<Option[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [leads, setLeads] = useState<Option[]>([]);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [stage, setStage] = useState("LEAD");
  const [clientId, setClientId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [expectedClose, setExpectedClose] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/crm/staff").then((r) => r.json()).then((d) => setStaff(d.staff ?? []));
    fetch("/api/crm/clients?limit=100").then((r) => r.json()).then((d) => setClients(d.clients ?? []));
    fetch("/api/crm/leads?limit=100").then((r) => r.json()).then((d) => setLeads(d.leads ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    const payload = {
      title,
      value: parseFloat(value) || 0,
      currency,
      stage,
      clientId,
      leadId,
      ownerId,
      expectedClose,
      notes,
    };
    const parsed = createDealSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string>);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to create deal.");
        return;
      }
      router.push(`/crm/deals/${data.deal.id}`);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required error={errors.title} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Value" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} error={errors.value} />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={["USD", "PKR", "EUR", "GBP", "AED"].map((c) => ({ value: c, label: c }))}
            />
          </div>
          <Select
            label="Stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            options={PIPELINE_STAGE_VALUES.map((s) => ({ value: s, label: pipelineStageLabel(s) }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={[{ value: "", label: "None" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <Select
              label="Lead"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              options={[{ value: "", label: "None" }, ...leads.map((l) => ({ value: l.id, label: l.name }))]}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Owner"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              options={[{ value: "", label: "Unassigned" }, ...staff.map((s) => ({ value: s.id, label: s.name }))]}
            />
            <Input label="Expected Close" type="date" value={expectedClose} onChange={(e) => setExpectedClose(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#FED7AA] bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
            />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Create Deal</Button>
      </div>
    </form>
  );
}
