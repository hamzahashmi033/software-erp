"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createTicketSchema, TICKET_PRIORITY_VALUES } from "@/lib/validations/crm";

interface Option {
  id: string;
  name: string;
}

export function TicketForm() {
  const router = useRouter();
  const [staff, setStaff] = useState<Option[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [clientId, setClientId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/crm/staff").then((r) => r.json()).then((d) => setStaff(d.staff ?? []));
    fetch("/api/crm/clients?limit=100").then((r) => r.json()).then((d) => setClients(d.clients ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    const payload = { subject, description, category, priority, clientId, assigneeId };
    const parsed = createTicketSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string>);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/crm/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to create ticket.");
        return;
      }
      router.push(`/crm/tickets/${data.ticket.id}`);
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
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required error={errors.subject} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#FED7AA] bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={TICKET_PRIORITY_VALUES.map((p) => ({ value: p, label: p }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={[{ value: "", label: "None" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <Select
              label="Assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              options={[{ value: "", label: "Unassigned" }, ...staff.map((s) => ({ value: s.id, label: s.name }))]}
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
        <Button type="submit" loading={saving}>Create Ticket</Button>
      </div>
    </form>
  );
}
