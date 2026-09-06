import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium transition-colors select-none tabular-nums",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15",
        secondary:
          "border-border bg-slate-100 text-slate-700 hover:bg-slate-200/70",
        destructive:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/70",
        danger:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/70",
        outline:
          "border-border bg-white text-slate-700 hover:bg-slate-50",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/70",
        info:
          "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
