"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGE_VALUES } from "@/lib/validations/crm";
import { pipelineStageLabel } from "@/lib/crm-helpers";

export function DealStageControl({ dealId, stage }: { dealId: string; stage: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(newStage: string) {
    setSaving(true);
    try {
      await fetch(`/api/crm/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={stage}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 rounded-lg border border-white/30 bg-white/10 px-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
    >
      {PIPELINE_STAGE_VALUES.map((s) => (
        <option key={s} value={s} className="text-gray-900">{pipelineStageLabel(s)}</option>
      ))}
    </select>
  );
}
