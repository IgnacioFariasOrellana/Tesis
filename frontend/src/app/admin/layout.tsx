import { DashboardShell } from "@/components/DashboardShell";
import { requireRole } from "@/lib/supabase/profile";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");
  return <DashboardShell role="admin">{children}</DashboardShell>;
}
