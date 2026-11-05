import type { DatabaseOrder } from "@/lib/db-types";

export function OrderActivity({ orders }: { orders: DatabaseOrder[] }) {
  const formatter = new Intl.DateTimeFormat("es-CL", { weekday: "short" });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return {
      label: formatter.format(date).replace(".", ""),
      count: orders.filter((order) => {
        const created = new Date(order.createdAt);
        return created >= date && created < next;
      }).length,
    };
  });
  const maximum = Math.max(1, ...days.map((day) => day.count));
  return (
    <ul className="admin-bar-chart" aria-label="Pedidos creados durante los últimos siete días">
      {days.map((day, index) => (
        <li key={`${day.label}-${index}`}>
          <div className="admin-bar-column">
            <span>{day.count}</span>
            <i
              style={{ height: `${Math.max(day.count ? 12 : 2, (day.count / maximum) * 100)}%` }}
            />
          </div>
          <small>{day.label}</small>
        </li>
      ))}
    </ul>
  );
}
