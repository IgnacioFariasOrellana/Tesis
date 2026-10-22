import { DemoOrder } from "./types";
const KEY = "allicam-demo-orders-v1";
export function getOrders(): DemoOrder[] {
  if (typeof window === "undefined") return [];
  try { const x = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(x) ? x : []; }
  catch { return []; }
}
export function saveOrder(order: DemoOrder): void {
  localStorage.setItem(KEY, JSON.stringify([order, ...getOrders()]));
}
