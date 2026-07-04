import { FileText, Image, Video, Mic } from "lucide-react";
import type { ContentTypeBreakdown } from "@/types/api";
import { useLanguage } from "@/context/LanguageContext";

interface Row {
  key: "text" | "image" | "video" | "audio";
  icon: React.ElementType;
  count: number;
  pct: number;
}

export function ContentBreakdownChart({ data }: { data: ContentTypeBreakdown | null }) {
  const { t } = useLanguage();

  if (!data) {
    return <div className="flex h-48 items-center justify-center text-sm text-slate-400">{t.common.loading}</div>;
  }

  const rows: Row[] = [
    { key: "text", icon: FileText, count: data.text_count, pct: data.text_pct },
    { key: "image", icon: Image, count: data.image_count, pct: data.image_pct },
    { key: "video", icon: Video, count: data.video_count, pct: data.video_pct },
    { key: "audio", icon: Mic, count: data.audio_count, pct: data.audio_pct },
  ];

  const labels: Record<Row["key"], string> = {
    text: t.submit.text,
    image: t.submit.image,
    video: t.submit.video,
    audio: t.submit.audio,
  };

  return (
    <div className="space-y-4">
      {rows.map(({ key, icon: Icon, count, pct }) => (
        <div key={key} className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-700">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{labels[key]}</span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {count} · {pct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-100">
              <div
                className={`h-full rounded-full bg-navy-600 transition-all duration-500 w-[${Math.max(pct, 2)}%]`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
