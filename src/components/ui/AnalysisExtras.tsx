import { Fingerprint } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { ContentType } from "@/types/api";

/**
 * Key forensic indicators reported by the detection engine
 * (Gemini indicators, HF model probabilities, or heuristic signal names).
 */
export function IndicatorChips({ indicators }: { indicators: string[] | null | undefined }) {
  const { t } = useLanguage();
  if (!indicators || indicators.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1 text-xs text-slate-500">
        <Fingerprint className="h-3.5 w-3.5" />
        {t.caseDetail.keyIndicators}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {indicators.map((ind) => (
          <span
            key={ind}
            className="rounded-full border border-line bg-paper-50 px-2.5 py-1 font-mono text-[11px] text-slate-600"
          >
            {ind}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Dual-axis sub-scores for text analysis: AI-generation probability and
 * fake-news / disinformation probability, rendered as labelled meters.
 */
export function SubScoreBars({ subScores }: { subScores: Record<string, number> | null | undefined }) {
  const { t } = useLanguage();
  if (!subScores) return null;

  const rows: { key: string; label: string; value: number }[] = [];
  if (typeof subScores.ai_text === "number") {
    rows.push({ key: "ai_text", label: t.caseDetail.aiTextScore, value: subScores.ai_text });
  }
  if (typeof subScores.fake_news === "number") {
    rows.push({ key: "fake_news", label: t.caseDetail.fakeNewsScore, value: subScores.fake_news });
  }
  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      {rows.map(({ key, label, value }) => {
        const pct = Math.round(value * 100);
        const tone =
          pct >= 70 ? "bg-danger-ink" : pct >= 30 ? "bg-warn-ink" : "bg-safe-ink";
        return (
          <div key={key}>
            <div className="mb-0.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">{label}</span>
              <span className="font-mono font-medium text-slate-700">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-paper-50">
              <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Inline preview of the analyzed media (image or audio) from its URL. */
export function MediaPreview({
  contentType,
  url,
}: {
  contentType: ContentType;
  url: string | null | undefined;
}) {
  const { t } = useLanguage();
  if (!url) return null;
  if (contentType === "image") {
    return (
      <div>
        <p className="mb-1.5 text-xs text-slate-500">{t.caseDetail.mediaPreview}</p>
        <img
          src={url}
          alt={t.caseDetail.mediaPreview}
          loading="lazy"
          className="max-h-72 rounded-md border border-line object-contain"
        />
      </div>
    );
  }
  if (contentType === "audio") {
    return (
      <div>
        <p className="mb-1.5 text-xs text-slate-500">{t.caseDetail.mediaPreview}</p>
        <audio controls preload="none" src={url} className="w-full" />
      </div>
    );
  }
  return null;
}
