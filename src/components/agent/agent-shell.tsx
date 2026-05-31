"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, PlusCircle, FileText } from "lucide-react";

interface AgentShellProps {
  children: React.ReactNode;
}

export function AgentShell({ children }: AgentShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    fetch("/api/auth/agent-logout", { method: "POST" }).finally(() => {
      router.push("/agent-login");
    });
  }

  const tabs = [
    { href: "/agent/new-invoice", label: "New Invoice", icon: PlusCircle },
    { href: "/agent/invoices", label: "My Invoices", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3FC]">
      <header className="sticky top-0 z-10 border-b border-[#DCC9F7] bg-white px-6 py-3">
        <div className="max-w-6xl flex items-center justify-between m-auto">
          <div className="flex items-center gap-6">
            <img src="/logo-v2-1.png" className="h-14 w-auto object-contain" />
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={[
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#DCC9F7] text-[#2D1879]"
                        : "text-gray-500 hover:bg-[#F5F3FC] hover:text-gray-800",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
