import type { ReactNode } from "react";

interface MetricCardProps {
  description?: string;
  icon?: ReactNode;
  title: string;
  toneClassName?: string;
  value: number | string;
}

export function MetricCard({
  description,
  icon,
  title,
  value,
}: MetricCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-150 hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        {icon ? (
          <div className="text-muted-foreground/80 transition-colors group-hover:text-foreground">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="my-2 sm:my-3">
        <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
      </div>

      {description ? (
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
