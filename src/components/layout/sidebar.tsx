"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  UserCog,
  Settings,
  Building2,
  Target,
  Handshake,
  LifeBuoy,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/invoices/new", label: "New Invoice", icon: PlusCircle },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/users", label: "Users", icon: UserCog },
  { href: "/settings", label: "Settings", icon: Settings },
];

const crmNavItems = [
  { href: "/crm/clients", label: "Clients", icon: Building2 },
  { href: "/crm/leads", label: "Leads", icon: Target },
  { href: "/crm/deals", label: "Deals", icon: Handshake },
  { href: "/crm/tickets", label: "Tickets", icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();

  return (
    <aside
      className={[
        "flex w-60 shrink-0 flex-col bg-[#7C2D12]",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
        "md:relative md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-center justify-center border-b border-white/10 px-5 py-5">
        <span className="text-base font-bold tracking-wide text-white">Admin Portal</span>
      </div>


      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#FED7AA] text-[#7C2D12]"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
          CRM
        </p>
        {crmNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#FED7AA] text-[#7C2D12]"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-white/30">© Leen Design Studios</p>
      </div>
    </aside>
  );
}
