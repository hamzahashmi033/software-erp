"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createLeadSchema } from "@/lib/validations/crm";

interface StaffOption {
  id: string;
  name: string;
}

export function LeadForm() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("NEW");
  const [notes, setNotes] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/crm/staff").then((r) => r.json()).then((d) => setStaff(d.staff ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    const payload = { name, email, phone, companyName, source, status, notes, assigneeId };
    const parsed = createLeadSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string>);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to create lead.");
        return;
      }
      router.push(`/crm/leads/${data.lead.id}`);
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required error={errors.name} />
            <Input label="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Source" placeholder="e.g. Referral, Website, Cold Call" value={source} onChange={(e) => setSource(e.target.value)} required error={errors.source} />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map((s) => ({ value: s, label: s }))}
            />
          </div>
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={[{ value: "", label: "Unassigned" }, ...staff.map((s) => ({ value: s.id, label: s.name }))]}
          />
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
        <Button type="submit" loading={saving}>Create Lead</Button>
      </div>
    </form>
  );
}
