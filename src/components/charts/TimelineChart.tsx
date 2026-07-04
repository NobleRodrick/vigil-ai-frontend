import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr as frLocale, enUS } from "date-fns/locale";
import type { TimelinePoint } from "@/types/api";
import { useLanguage } from "@/context/LanguageContext";

const COLORS = {
  malicious: "#9c3530",
  suspicious: "#9c6611",
  safe: "#1b6e46",
};

export function TimelineChart({ data }: { data: TimelinePoint[] }) {
  const { lang, t } = useLanguage();
  const locale = lang === "fr" ? frLocale : enUS;

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        {t.common.loading}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="fillMalicious" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.malicious} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.malicious} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillSuspicious" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.suspicious} stopOpacity={0.2} />
            <stop offset="95%" stopColor={COLORS.suspicious} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillSafe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.safe} stopOpacity={0.15} />
            <stop offset="95%" stopColor={COLORS.safe} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#dce3ea" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => format(parseISO(d), "d MMM", { locale })}
          tick={{ fontSize: 11, fill: "#5b6b7c" }}
          axisLine={{ stroke: "#dce3ea" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#5b6b7c" }}
          axisLine={false}
          tickLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          labelFormatter={(d) => format(parseISO(String(d)), "PPP", { locale })}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #dce3ea",
            fontFamily: "IBM Plex Sans",
          }}
        />
        <Area
          type="monotone"
          dataKey="malicious"
          stackId="1"
          stroke={COLORS.malicious}
          fill="url(#fillMalicious)"
          strokeWidth={1.5}
          name={t.classification.malicious}
        />
        <Area
          type="monotone"
          dataKey="suspicious"
          stackId="1"
          stroke={COLORS.suspicious}
          fill="url(#fillSuspicious)"
          strokeWidth={1.5}
          name={t.classification.suspicious}
        />
        <Area
          type="monotone"
          dataKey="safe"
          stackId="1"
          stroke={COLORS.safe}
          fill="url(#fillSafe)"
          strokeWidth={1.5}
          name={t.classification.safe}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
