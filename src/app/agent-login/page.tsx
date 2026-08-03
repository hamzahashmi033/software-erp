"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

function AgentLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/agent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Invalid username or password. Please try again.");
        return;
      }

      router.push("/agent/new-invoice");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#FED7AA] bg-white p-8 shadow-sm space-y-5"
    >
      <h2 className="text-base font-semibold text-gray-900">Sign in to continue</h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-800">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          className="w-full rounded-lg border border-[#FED7AA] bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-800">Password</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[#FED7AA] bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#EA580C]"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" loading={loading} className="w-full bg-[#F97316]">
        Sign in
      </Button>
    </form>
  );
}

export default function AgentLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF7ED] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img
            src="/logo-v2-1.png"
            className="h-22"
          />
        </div>

        <Suspense fallback={
          <div className="rounded-2xl border border-[#FED7AA] bg-white p-8 text-center text-sm text-gray-400">
            Loading...
          </div>
        }>
          <AgentLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
