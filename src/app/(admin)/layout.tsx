import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
