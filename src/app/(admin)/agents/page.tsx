"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Agent {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data.agents ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setCreating(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create agent.");
        return;
      }
      setFormSuccess(`Agent "${data.agent.name}" created successfully.`);
      setName("");
      setEmail("");
      setPassword("");
      fetchAgents();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, agentName: string) {
    if (!confirm(`Delete agent "${agentName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/agents/${id}`, { method: "DELETE" });
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden ">
      <TopBar title="Agents" />
      <main className="flex-1 overflow-y-auto w-full">
        <PageHeader
          title="Agent Accounts"
          description="Create agent logins. Agents can only access the invoice creation form."
        />

        <div className="px-6 pb-8 space-y-6 w-full">
          {/* Create form */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDE9FB]">
                  <Plus className="h-4 w-4 text-[#4027C1]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Create New Agent</h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Sarah Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    helper="Shown as 'Created By' on invoices and emails"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="e.g. sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    helper="Used to log in and shown to clients"
                  />
                </div>

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-[#4027C1]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    {formSuccess}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" loading={creating}>
                    <Plus className="h-4 w-4" />
                    Create Agent
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Agent list */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDE9FB]">
                  <Users className="h-4 w-4 text-[#4027C1]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Existing Agents</h2>
                <span className="ml-auto text-xs text-gray-400">{agents.length} agent{agents.length !== 1 ? "s" : ""}</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4027C1] border-t-transparent" />
                </div>
              ) : agents.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No agents yet. Create one above.</p>
              ) : (
                <div className="divide-y divide-[#EDE9FB]">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-400">
                          {agent.email} &nbsp;·&nbsp; Created {new Date(agent.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(agent.id, agent.name)}
                        disabled={deletingId === agent.id}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === agent.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portal link hint */}
          <div className="rounded-xl border border-[#DCC9F7] bg-[#F5F3FC] px-4 py-3 text-sm text-gray-600">
            Agent login portal:{" "}
            <span className="font-mono text-[#4027C1]">
              {typeof window !== "undefined" ? window.location.origin : ""}/agent-login
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
