"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  isPrimary: boolean;
}

export function ClientContacts({ clientId, contacts }: { clientId: string; contacts: Contact[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/clients/${clientId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, title, isPrimary: contacts.length === 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add contact.");
        return;
      }
      setName(""); setEmail(""); setPhone(""); setTitle("");
      setAdding(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(contactId: string) {
    setDeletingId(contactId);
    try {
      await fetch(`/api/crm/clients/${clientId}/contacts/${contactId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {contacts.length === 0 && !adding && (
        <p className="text-sm text-gray-400">No contacts yet.</p>
      )}

      {contacts.map((c) => (
        <div key={c.id} className="flex items-start justify-between rounded-lg border border-[#FFEDD5] bg-[#FFF7ED] px-3 py-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-800">{c.name}</p>
              {c.isPrimary && <Star className="h-3 w-3 fill-[#EA580C] text-[#EA580C]" />}
            </div>
            {c.title && <p className="text-xs text-gray-500">{c.title}</p>}
            <p className="text-xs text-gray-400">{[c.email, c.phone].filter(Boolean).join(" · ")}</p>
          </div>
          <button
            onClick={() => handleDelete(c.id)}
            disabled={deletingId === c.id}
            className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="space-y-2 rounded-lg border border-[#FED7AA] p-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>Save</Button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs text-gray-500 hover:underline">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-[#EA580C] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add contact
        </button>
      )}
    </div>
  );
}
