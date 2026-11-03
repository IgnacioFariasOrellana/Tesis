import { DashboardShell } from "@/components/DashboardShell";
import { requireRole } from "@/lib/supabase/profile";
export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  await requireRole("repartidor");
  return <DashboardShell role="repartidor">{children}</DashboardShell>;
}
