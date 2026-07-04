import { clsx } from "clsx";
import type { Classification } from "@/types/api";
import { useLanguage } from "@/context/LanguageContext";

interface VerdictStampProps {
  classification: Classification | null;
  score: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-12 w-12 text-[9px]", scoreText: "text-[11px]" },
  md: { box: "h-16 w-16 text-[10px]", scoreText: "text-sm" },
  lg: { box: "h-24 w-24 text-xs", scoreText: "text-xl" },
};

const stampClassMap: Record<Classification, string> = {
  safe: "stamp-safe",
  suspicious: "stamp-suspicious",
  malicious: "stamp-malicious",
};

/**
 * VIGIL-AI's signature visual element: an official document stamp
 * ("cachet") rendering the AI-detection verdict — evoking the rubber
 * administrative stamps used throughout Francophone African bureaucracy.
 */
export function VerdictStamp({ classification, score, size = "md", className }: VerdictStampProps) {
  const { t } = useLanguage();
  const dims = sizeMap[size];

  if (!classification || score === null) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400",
          dims.box,
          className
        )}
      >
        <span className="font-mono text-[9px] uppercase tracking-wider">…</span>
      </div>
    );
  }

  return (
    <div
      className={clsx("stamp flex-col gap-0.5 leading-none", stampClassMap[classification], dims.box, className)}
      role="img"
      aria-label={`${t.classification[classification]}: ${score}/100`}
    >
      <span className={clsx("font-bold tabular-nums", dims.scoreText)}>{score}</span>
      <span>{t.classification[classification]}</span>
    </div>
  );
}

/** Compact inline pill version for table rows */
export function VerdictPill({ classification, score }: { classification: Classification | null; score: number | null }) {
  const { t } = useLanguage();
  if (!classification || score === null) {
    return <span className="text-sm text-slate-400">—</span>;
  }
  const colorMap: Record<Classification, string> = {
    safe: "text-safe-ink bg-safe-bg border-safe-line",
    suspicious: "text-warn-ink bg-warn-bg border-warn-line",
    malicious: "text-danger-ink bg-danger-bg border-danger-line",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide",
        colorMap[classification]
      )}
    >
      <span className="tabular-nums">{score}</span>
      <span className="opacity-60">·</span>
      {t.classification[classification]}
    </span>
  );
}
