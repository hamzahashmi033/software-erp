"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Phone, Mail, Users, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface Activity {
  id: string;
  type: string;
  note: string;
  createdAt: Date | string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: StickyNote,
};

export function LeadActivities({ leadId, activities }: { leadId: string; activities: Activity[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("NOTE");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add activity.");
        return;
      }
      setNote("");
      setAdding(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {activities.length === 0 && !adding && <p className="text-sm text-gray-400">No activity yet.</p>}

      <div className="space-y-2">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type] ?? StickyNote;
          return (
            <div key={activity.id} className="flex gap-3 rounded-lg border border-[#FFEDD5] bg-[#FFF7ED] px-3 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FED7AA]">
                <Icon className="h-3.5 w-3.5 text-[#EA580C]" />
              </div>
              <div>
                <p className="text-sm text-gray-800">{activity.note}</p>
                <p className="text-xs text-gray-400">{activity.type} · {new Date(activity.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </div>
          );
        })}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="space-y-2 rounded-lg border border-[#FED7AA] p-3">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={["CALL", "EMAIL", "MEETING", "NOTE"].map((t) => ({ value: t, label: t }))}
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened?"
            required
            rows={2}
            className="w-full rounded-lg border border-[#FED7AA] bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>Save</Button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs text-gray-500 hover:underline">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-medium text-[#EA580C] hover:underline">
          <Plus className="h-3.5 w-3.5" />
          Log activity
        </button>
      )}
    </div>
  );
}
