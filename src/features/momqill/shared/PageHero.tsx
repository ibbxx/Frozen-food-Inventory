import type { ReactNode } from "react";

interface PageHeroProps {
  actions?: ReactNode;
  badge?: ReactNode;
  description: string;
  aside?: ReactNode;
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
    <section className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          {badge}
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {actions || aside ? <div>{actions || aside}</div> : null}
      </div>
    </section>
  );
}
