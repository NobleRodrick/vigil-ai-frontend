import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Inbox, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { submissionsApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import type { SubmissionSummary } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoading, ErrorState, EmptyState } from "@/components/ui/Feedback";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  analyzing: "Analyzing",
  complete: "Complete",
  failed: "Failed",
};

export default function SubmissionsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: SubmissionSummary[]; total_count: number; total_pages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await submissionsApi.list({ page, page_size: PAGE_SIZE, my_only: true });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this submission permanently? This cannot be undone.")) return;
    try {
      await submissionsApi.remove(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <Card>
        {isLoading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title={t.cases.noCases}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">{t.cases.caseNumber}</th>
                    <th className="px-5 py-3">{t.cases.type}</th>
                    <th className="px-5 py-3">{t.cases.status}</th>
                    <th className="px-5 py-3">{t.cases.created}</th>
                    {user?.role.name === "admin" && <th className="px-5 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-paper-50">
                      <td className="px-5 py-3">
                        <Link to={`/submissions/${s.id}`} className="font-mono font-medium text-navy-700 hover:underline">
                          {s.case_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-600">{s.content_type}</td>
                      <td className="px-5 py-3 text-slate-600">{STATUS_LABEL[s.status] ?? s.status}</td>
                      <td className="px-5 py-3 text-slate-500">{format(parseISO(s.created_at), "PP")}</td>
                      {user?.role.name === "admin" && (
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="rounded p-1 text-slate-400 hover:bg-danger-bg hover:text-danger-ink"
                            aria-label="Delete submission"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-slate-500">
              <span>
                {t.common.page} {page} {t.common.of} {data.total_pages} — {data.total_count} {t.common.items}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  ←
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>
                  →
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
