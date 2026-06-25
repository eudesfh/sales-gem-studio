import { Card, CardContent } from "@/components/ui/card";
import { type ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  iconBgClass?: string;
}

export function KpiCard({ label, value, hint, icon, iconBgClass = "bg-primary/10 text-primary" }: Props) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm transition-all hover:shadow-md hover:border-border">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="text-[11px] text-muted-foreground/85 font-medium leading-none">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

