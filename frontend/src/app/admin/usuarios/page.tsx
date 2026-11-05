import { UserAdminClient } from "@/components/admin/UserAdminClient";
import { requireRole } from "@/lib/supabase/profile";

export default async function UsersPage() {
  const admin = await requireRole("admin");
  return <UserAdminClient currentUserId={admin.id} />;
}
