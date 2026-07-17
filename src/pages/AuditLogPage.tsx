import { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { ScrollText, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { auditApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import type { AuditLogEntry } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageLoading, ErrorState, EmptyState } from "@/components/ui/Feedback";

const PAGE_SIZE = 25;

/** Tone of the action chip by verb family. */
function actionTone(action: string): string {
  if (action.includes("FAILED") || action.includes("LOCKED") || action.includes("DELETED") || action.includes("ESCALATED")) {
    return "bg-danger-bg text-danger-ink border-danger-line";
  }
  if (action.includes("CREATED") || action.includes("COMPLETED") || action.includes("RESOLVED")) {
    return "bg-safe-bg text-safe-ink border-safe-line";
  }
  return "bg-paper-50 text-slate-600 border-line";
}

export default function AuditLogPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [data, setData] = useState<{ items: AuditLogEntry[]; total_count: number; total_pages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await auditApi.list({
        page,
        page_size: PAGE_SIZE,
        action: action || undefined,
        user_search: userSearch || undefined,
      });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, action, userSearch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    auditApi.actions().then(setActions).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[220px] flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t.auditLog.searchUser}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-64">
            <Select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.auditLog.allActions}</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={<ScrollText className="h-5 w-5" />} title={t.auditLog.empty} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">{t.auditLog.time}</th>
                    <th className="px-5 py-3">{t.auditLog.user}</th>
                    <th className="px-5 py-3">{t.auditLog.action}</th>
                    <th className="px-5 py-3">{t.auditLog.detail}</th>
                    <th className="px-5 py-3">{t.auditLog.ip}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((entry) => (
                    <tr key={entry.id} className="align-top transition-colors hover:bg-paper-50">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-500">
                        {format(parseISO(entry.created_at), "PP p")}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{entry.user_name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{entry.user_email ?? ""}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-semibold ${actionTone(entry.action)}`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="max-w-[300px] px-5 py-3 text-xs text-slate-500">
                        {entry.details ? (
                          <span className="break-all font-mono">
                            {Object.entries(entry.details)
                              .map(([k, v]) => `${k}: ${String(v)}`)
                              .join(" · ")}
                          </span>
                        ) : (
                          entry.resource_type && (
                            <span className="font-mono">{entry.resource_type}</span>
                          )
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-400">
                        {entry.ip_address ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
