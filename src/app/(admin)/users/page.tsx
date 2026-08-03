"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCog, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, KeyRound, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Role {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  Role: Role;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [passwordEditId, setPasswordEditId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccessId, setPasswordSuccessId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([fetch("/api/users"), fetch("/api/roles")]);
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      setUsers(usersData.users ?? []);
      setRoles(rolesData.roles ?? []);
      if (!roleId && rolesData.roles?.length) setRoleId(rolesData.roles[0].id);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, roleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create user.");
        return;
      }
      setFormSuccess(`User "${data.user.name}" created successfully.`);
      setName("");
      setEmail("");
      setPassword("");
      fetchData();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, userName: string) {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRoleChange(id: string, newRoleId: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: newRoleId }),
      });
      if (res.ok) {
        const role = roles.find((r) => r.id === newRoleId);
        setUsers((prev) => prev.map((u) => (u.id === id && role ? { ...u, Role: role } : u)));
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive } : u)));
      }
    } finally {
      setSavingId(null);
    }
  }

  function openPasswordEditor(id: string) {
    setPasswordEditId(id);
    setNewPassword("");
    setShowNewPassword(false);
    setPasswordError("");
    setPasswordSuccessId(null);
  }

  function closePasswordEditor() {
    setPasswordEditId(null);
    setNewPassword("");
    setPasswordError("");
  }

  async function handlePasswordSave(id: string) {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Failed to update password.");
        return;
      }
      setPasswordEditId(null);
      setNewPassword("");
      setPasswordSuccessId(id);
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  return (
    <div className="flex flex-col flex-1 overflow-hidden ">
      <TopBar title="Users" />
      <main className="flex-1 overflow-y-auto w-full">
        <PageHeader
          title="Staff Users"
          description="Manage internal staff accounts and their roles. Roles control access to ERP modules."
        />

        <div className="px-4 sm:px-6 pb-8 space-y-6 w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFEDD5]">
                  <Plus className="h-4 w-4 text-[#EA580C]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Create New User</h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Sarah Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="e.g. sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    helper="Used to log in to the staff portal"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      className="absolute right-3 top-[34px] text-gray-400 hover:text-[#EA580C]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Select
                    label="Role"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    options={roleOptions}
                    required
                  />
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
                    Create User
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFEDD5]">
                  <UserCog className="h-4 w-4 text-[#EA580C]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Existing Users</h2>
                <span className="ml-auto text-xs text-gray-400">{users.length} user{users.length !== 1 ? "s" : ""}</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#EA580C] border-t-transparent" />
                </div>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No users yet. Create one above.</p>
              ) : (
                <div className="divide-y divide-[#FFEDD5]">
                  {users.map((user) => (
                    <div key={user.id} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            {!user.isActive && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {user.email} &nbsp;·&nbsp; Created {new Date(user.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                            <select
                              value={user.Role.id}
                              disabled={savingId === user.id}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="h-8 rounded-lg border border-[#FED7AA] bg-white px-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EA580C] disabled:opacity-50"
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => handleToggleActive(user.id, !user.isActive)}
                            disabled={savingId === user.id}
                            className="rounded-lg px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            onClick={() =>
                              passwordEditId === user.id
                                ? closePasswordEditor()
                                : openPasswordEditor(user.id)
                            }
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#EA580C] hover:bg-[#FFF7ED] transition-colors"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Password
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deletingId === user.id}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingId === user.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>

                      {passwordEditId === user.id && (
                        <div className="mt-3 flex flex-wrap items-start gap-2 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-3">
                          <div className="relative flex-1 min-w-[180px]">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="New password (min. 6 characters)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              minLength={6}
                              autoFocus
                              className="h-9 w-full rounded-lg border border-[#FED7AA] bg-white pl-3 pr-9 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((v) => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#EA580C]"
                            >
                              {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <Button
                            size="sm"
                            type="button"
                            loading={savingPassword}
                            onClick={() => handlePasswordSave(user.id)}
                          >
                            Save
                          </Button>
                          <button
                            type="button"
                            onClick={closePasswordEditor}
                            className="h-9 rounded-lg px-3 text-xs text-gray-500 hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                          {passwordError && (
                            <div className="flex w-full items-center gap-2 text-xs text-red-600">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              {passwordError}
                            </div>
                          )}
                        </div>
                      )}

                      {passwordSuccessId === user.id && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                          Password updated successfully.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-sm text-gray-600">
            Staff login portal:{" "}
            <span className="font-mono text-[#EA580C]">
              {typeof window !== "undefined" ? window.location.origin : ""}/staff-login
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
