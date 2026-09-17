import type { ReactNode } from "react";

interface PageHeroProps {
  actions?: ReactNode;
  aside?: ReactNode;
  badge?: ReactNode;
  description?: string;
  title: string;
}

export function PageHero({
  actions,
  aside,
  badge,
  description,
  title,
}: PageHeroProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border/80 bg-white p-4 sm:p-6 shadow-xs md:flex-row md:items-center md:justify-between">
      <div className="space-y-1 min-w-0 flex-1">
        {badge ? <div className="mb-1.5">{badge}</div> : null}
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      {actions || aside ? (
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t border-border/40 md:border-t-0 shrink-0">
          {aside}
          {actions}
        </div>
      ) : null}
    </section>
  );
}
