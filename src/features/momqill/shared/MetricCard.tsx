import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import type { ReactNode } from "react";

interface MetricCardProps {
  description: string;
  icon: ReactNode;
  title: string;
  toneClassName: string;
  value: number;
}

export function MetricCard({
  description,
  icon,
  title,
  toneClassName,
  value,
}: MetricCardProps) {
  return (
    <Card className={`border-white/70 shadow-sm ${toneClassName}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardDescription className="text-slate-600">{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-semibold text-slate-900">{value}</CardTitle>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
