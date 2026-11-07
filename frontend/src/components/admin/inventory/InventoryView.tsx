import { getAuthorizedData } from "@/lib/auth-api";
import type { InventoryItem } from "@/lib/db-types";
import { InventoryAdminClient } from "./InventoryAdminClient";

export default async function InventoryView() {
  try {
    const inventory = await getAuthorizedData<InventoryItem[]>("/api/admin/inventory");
    return <InventoryAdminClient initialInventory={inventory} />;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "No se pudo consultar el inventario.";
    return <InventoryAdminClient initialInventory={[]} initialLoadError={message} />;
  }
}
