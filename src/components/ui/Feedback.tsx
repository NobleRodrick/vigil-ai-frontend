import type { ReactNode } from "react";
import { clsx } from "clsx";
import { AlertCircle, Inbox } from "lucide-react";
import type { CaseStatus } from "@/types/api";
import { useLanguage } from "@/context/LanguageContext";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("animate-spin text-navy-500", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3.2a4.8 4.8 0 00-4.8 4.8H4z" />
    </svg>
  );
}

export function PageLoading() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Spinner className="h-7 w-7" />
        <span className="text-sm">{t.common.loading}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-100 text-slate-400">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-bg text-danger-ink">
        <AlertCircle className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-navy-600 underline-offset-2 hover:underline"
        >
          {t.common.retry}
        </button>
      )}
    </div>
  );
}

const statusColorMap: Record<CaseStatus, string> = {
  open: "bg-navy-50 text-navy-700 border-navy-100",
  in_review: "bg-warn-bg text-warn-ink border-warn-line",
  resolved: "bg-safe-bg text-safe-ink border-safe-line",
  archived: "bg-paper-100 text-slate-500 border-line",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  const { t } = useLanguage();
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        statusColorMap[status]
      )}
    >
      {t.caseStatus[status]}
    </span>
  );
}
