import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";
import type { RiskDistribution } from "@/types/api";
import { EmptyState } from "@/components/ui/Feedback";

/** Histogram of analysis risk scores, colored by classification band. */
export function RiskDistributionChart({ data }: { data: RiskDistribution | null }) {
  const { t } = useLanguage();

  if (!data || data.buckets.length === 0 || data.buckets.every((b) => b.count === 0)) {
    return <EmptyState title={t.dashboard.noRecentCases} />;
  }

  const barColor = (bucket: string): string => {
    const start = parseInt(bucket.split("-")[0], 10);
    if (start >= 70) return "var(--color-danger-ink, #9a3412)";
    if (start >= 30) return "var(--color-warn-ink, #92600a)";
    return "var(--color-safe-ink, #1a6339)";
  };

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e2d8" />
            <XAxis
              dataKey="bucket"
              tick={{ fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#e7e2d8" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e2d8" }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.buckets.map((b) => (
                <Cell key={b.bucket} fill={barColor(b.bucket)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-6 text-xs text-slate-500">
        <span>
          {t.dashboard.avgScore}:{" "}
          <span className="font-mono font-medium text-slate-700">
            {data.average_score ?? "—"}
          </span>
        </span>
        <span>
          {t.dashboard.medianScore}:{" "}
          <span className="font-mono font-medium text-slate-700">
            {data.median_score ?? "—"}
          </span>
        </span>
      </div>
    </div>
  );
}
