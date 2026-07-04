import type { ReactNode } from "react";
import { clsx } from "clsx";
import { ArrowUpRight } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: "neutral" | "safe" | "warn" | "danger";
  footnote?: string;
}

const toneMap = {
  neutral: "bg-navy-50 text-navy-700",
  safe: "bg-safe-bg text-safe-ink",
  warn: "bg-warn-bg text-warn-ink",
  danger: "bg-danger-bg text-danger-ink",
};

export function KpiCard({ label, value, icon, tone = "neutral", footnote }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-line bg-paper-0 p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={clsx("flex h-8 w-8 items-center justify-center rounded-md", toneMap[tone])}>
          {icon}
        </div>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
      {footnote && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
          <ArrowUpRight className="h-3 w-3" />
          {footnote}
        </p>
      )}
    </div>
  );
}
