import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  description: string;
  Icon: LucideIcon;
  progress?: number;
  tone?: "rose" | "sage" | "amber" | "plum";
};

export function AdminMetricCard({
  title,
  value,
  description,
  Icon,
  progress = 0,
  tone = "rose",
}: Props) {
  const percentage = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
  const large = String(value).length > 5;
  return (
    <article className={`admin-metric admin-tone-${tone}`}>
      <div className="admin-metric-heading">
        <span className="admin-metric-icon">
          <Icon size={17} />
        </span>
        <h2>{title}</h2>
      </div>
      <div className="admin-metric-body">
        <div
          className="admin-ring"
          style={{ "--ring-progress": `${percentage * 3.6}deg` } as React.CSSProperties}
        >
          <div className="admin-ring-label">
            <strong className={large ? "admin-ring-large-count" : ""}>{value}</strong>
          </div>
        </div>
        <p>{description}</p>
      </div>
    </article>
  );
}
