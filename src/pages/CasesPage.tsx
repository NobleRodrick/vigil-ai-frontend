import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Search, Download, FolderSearch } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { casesApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import type { CaseSummary } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Feedback";
import { VerdictPill } from "@/components/ui/VerdictStamp";
import { PageLoading, ErrorState, EmptyState } from "@/components/ui/Feedback";

const PAGE_SIZE = 20;

export default function CasesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [classification, setClassification] = useState(searchParams.get("classification") ?? "");
  const [contentType, setContentType] = useState("");
  const [myOnly, setMyOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [data, setData] = useState<{ items: CaseSummary[]; total_count: number; total_pages: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await casesApi.list({
        page,
        page_size: PAGE_SIZE,
        status: status || undefined,
        classification: classification || undefined,
        content_type: contentType || undefined,
        assigned_to_me: myOnly || undefined,
        search: search || undefined,
      });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, classification, contentType, myOnly, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // Keep the URL in sync with the search filter so toast/redirect links work
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (classification) params.classification = classification;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, classification]);

  const handleExport = async () => {
    const blob = await casesApi.exportCsv(status || undefined);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vigil_ai_cases_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[220px] flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t.cases.search}
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-40">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.cases.allStatuses}</option>
              <option value="open">{t.caseStatus.open}</option>
              <option value="in_review">{t.caseStatus.in_review}</option>
              <option value="resolved">{t.caseStatus.resolved}</option>
              <option value="archived">{t.caseStatus.archived}</option>
            </Select>
          </div>

          <div className="w-44">
            <Select
              value={classification}
              onChange={(e) => {
                setClassification(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.cases.allClassifications}</option>
              <option value="safe">{t.classification.safe}</option>
              <option value="suspicious">{t.classification.suspicious}</option>
              <option value="malicious">{t.classification.malicious}</option>
            </Select>
          </div>

          <div className="w-36">
            <Select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.cases.allTypes}</option>
              <option value="text">{t.submit.text}</option>
              <option value="image">{t.submit.image}</option>
              <option value="video">{t.submit.video}</option>
              <option value="audio">{t.submit.audio}</option>
            </Select>
          </div>

          <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={myOnly}
              onChange={(e) => {
                setMyOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-line text-navy-700 focus:ring-navy-300"
            />
            {t.cases.myCasesOnly}
          </label>

          {user?.role.name === "admin" && (
            <Button variant="outline" size="md" onClick={handleExport}>
              <Download className="h-4 w-4" />
              {t.cases.export}
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={<FolderSearch className="h-5 w-5" />} title={t.cases.noCases} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">{t.cases.caseNumber}</th>
                    <th className="px-5 py-3">{t.cases.type}</th>
                    <th className="px-5 py-3">{t.cases.classification}</th>
                    <th className="px-5 py-3">{t.cases.status}</th>
                    <th className="px-5 py-3">{t.cases.assignee}</th>
                    <th className="px-5 py-3">{t.cases.created}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="cursor-pointer transition-colors hover:bg-paper-50"
                    >
                      <td className="px-5 py-3">
                        <Link
                          to={`/cases/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono font-medium text-navy-700 hover:underline"
                        >
                          {c.case_number}
                        </Link>
                        {c.is_escalated && (
                          <span className="ml-2 rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-danger-ink">
                            {t.caseDetail.escalated}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-600">{c.content_type}</td>
                      <td className="px-5 py-3">
                        <VerdictPill classification={c.classification} score={c.risk_score} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {c.assignee_name ?? <span className="text-slate-400">{t.cases.unassigned}</span>}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{format(parseISO(c.created_at), "PP")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-slate-500">
              <span>
                {t.common.page} {data && page} {t.common.of} {data.total_pages} — {data.total_count}{" "}
                {t.common.items}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
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
