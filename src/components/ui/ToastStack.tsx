import { Link } from "react-router-dom";
import { X, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { clsx } from "clsx";
import type { WebSocketNotification } from "@/types/api";
import { useLanguage } from "@/context/LanguageContext";

interface ToastStackProps {
  notifications: WebSocketNotification[];
  onDismiss: (index: number) => void;
}

const iconMap = {
  safe: <ShieldCheck className="h-5 w-5 text-safe-ink" />,
  suspicious: <ShieldQuestion className="h-5 w-5 text-warn-ink" />,
  malicious: <ShieldAlert className="h-5 w-5 text-danger-ink" />,
};

export function ToastStack({ notifications, onDismiss }: ToastStackProps) {
  const { t } = useLanguage();

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {notifications.map((n, i) => {
        if (n.type !== "analysis_complete") return null;
        const cls = n.classification ?? "safe";
        return (
          <div
            key={`${n.submission_id}-${i}`}
            className={clsx(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-paper-0 p-4 shadow-lg animate-in",
              "border-line"
            )}
            role="status"
          >
            <div className="mt-0.5 shrink-0">{iconMap[cls]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {n.case_number} · {n.risk_score}/100
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {t.classification[cls]} — {t.submit.successMessage.split(".")[0]}.
              </p>
              {n.submission_id && (
                <Link
                  to={`/submissions/${n.submission_id}`}
                  className="mt-1.5 inline-block text-sm font-medium text-navy-600 hover:underline"
                  onClick={() => onDismiss(i)}
                >
                  {t.submit.viewCase} →
                </Link>
              )}
            </div>
            <button
              onClick={() => onDismiss(i)}
              className="shrink-0 rounded p-1 text-slate-400 hover:bg-paper-100 hover:text-slate-600"
              aria-label={t.common.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
