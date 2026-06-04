import { SidebarProvider } from "./sidebar-context";
import { MobileBackdrop } from "./mobile-backdrop";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#F5F3FC]">
        <MobileBackdrop />
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
