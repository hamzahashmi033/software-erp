"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  action?: React.ReactNode;
}

export function TopBar({ title, action }: TopBarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#DCC9F7] bg-white px-6">
      <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {action}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
