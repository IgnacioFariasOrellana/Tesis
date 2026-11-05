import OrderHistoryView from "@/components/shop/orders/OrderHistoryView";

export default function OrdersPage({ searchParams }: { searchParams: Promise<{ creado?: string }> }) {
  return <OrderHistoryView searchParams={searchParams} />;
}
