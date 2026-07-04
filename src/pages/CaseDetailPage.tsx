import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Cpu,
  Gauge,
  User as UserIcon,
  Link as LinkIcon,
  TriangleAlert,
  History,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { casesApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import type { CaseDetail, CaseStatus } from "@/types/api";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Feedback";
import { VerdictStamp } from "@/components/ui/VerdictStamp";
import { PageLoading, ErrorState } from "@/components/ui/Feedback";

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [data, setData] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isPostingNote, setIsPostingNote] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const canAct = user?.role.name === "admin" || user?.role.name === "analyst";

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await casesApi.get(id);
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) return <PageLoading />;
  if (error || !data) return <ErrorState message={error ?? t.common.error} onRetry={load} />;

  const explanation = lang === "fr" ? data.explanation_fr : data.explanation_en;

  const handleStatusChange = async (next: CaseStatus, summary?: string) => {
    if (!id) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await casesApi.updateStatus(id, next, summary);
      await load();
      setResolveOpen(false);
      setResolutionSummary("");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;
    setIsPostingNote(true);
    setActionError(null);
    try {
      await casesApi.addNote(id, noteText.trim());
      setNoteText("");
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsPostingNote(false);
    }
  };

  const handleEscalate = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || escalateReason.trim().length < 20) {
      setActionError(t.common.required);
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await casesApi.escalate(id, escalateReason.trim());
      setEscalateOpen(false);
      setEscalateReason("");
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!id || !user) return;
    setActionLoading(true);
    try {
      await casesApi.assign(id, user.id);
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link to="/cases" className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.cases.title}
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-semibold text-slate-900">{data.case_number}</h1>
            <StatusBadge status={data.status} />
            {data.is_escalated && (
              <span className="flex items-center gap-1 rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold uppercase text-danger-ink">
                <TriangleAlert className="h-3 w-3" />
                {t.caseDetail.escalated}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t.caseDetail.submittedBy} {data.submitter_name ?? "—"} ·{" "}
            {format(parseISO(data.submitted_at), "PPp")}
          </p>
        </div>
        <VerdictStamp classification={data.classification} score={data.risk_score} size="lg" />
      </div>

      {actionError && (
        <div className="mb-4 rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Submission details */}
          <Card>
            <CardHeader>
              <CardTitle>{t.caseDetail.submissionDetails}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {data.content_text_preview && (
                <p className="whitespace-pre-wrap rounded-md bg-paper-50 p-3 text-sm text-slate-700">
                  {data.content_text_preview}
                </p>
              )}
              {data.content_url && (
                <a
                  href={data.content_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-navy-600 hover:underline"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  {data.content_url}
                </a>
              )}
              {data.file_name && <p className="text-sm text-slate-600">{data.file_name}</p>}
              {data.analyst_notes && (
                <p className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">Notes: </span>
                  {data.analyst_notes}
                </p>
              )}
            </CardBody>
          </Card>

          {/* Analysis result */}
          <Card>
            <CardHeader>
              <CardTitle>{t.caseDetail.analysisResult}</CardTitle>
            </CardHeader>
            <CardBody>
              {data.risk_score === null ? (
                <p className="text-sm text-slate-400">{t.caseDetail.notAnalyzedYet}</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <Metric icon={<Gauge className="h-3.5 w-3.5" />} label={t.caseDetail.riskScore} value={`${data.risk_score}/100`} />
                    <Metric
                      icon={<Gauge className="h-3.5 w-3.5" />}
                      label={t.caseDetail.confidence}
                      value={data.confidence !== null ? `${Math.round(data.confidence * 100)}%` : "—"}
                    />
                    <Metric icon={<Cpu className="h-3.5 w-3.5" />} label={t.caseDetail.engine} value={data.engine_used ?? "—"} />
                  </div>
                  {explanation && (
                    <p className="rounded-md border border-line bg-paper-50 p-3 text-sm leading-relaxed text-slate-700">
                      {explanation}
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t.caseDetail.notes}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {data.notes.length === 0 && <p className="text-sm text-slate-400">—</p>}
                {data.notes.map((n) => (
                  <div key={n.id} className="rounded-md border border-line p-3">
                    <p className="text-sm text-slate-700">{n.content}</p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {n.author_full_name} · {format(parseISO(n.created_at), "PPp")}
                    </p>
                  </div>
                ))}
              </div>
              {canAct && (
                <form onSubmit={handleAddNote} className="mt-4 space-y-2">
                  <Textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={t.caseDetail.notePlaceholder}
                  />
                  <Button type="submit" size="sm" isLoading={isPostingNote} disabled={!noteText.trim()}>
                    {t.caseDetail.postNote}
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>{t.caseDetail.history}</CardTitle>
            </CardHeader>
            <CardBody>
              {data.history.length === 0 ? (
                <p className="text-sm text-slate-400">—</p>
              ) : (
                <ol className="space-y-3">
                  {data.history.map((h) => (
                    <li key={h.id} className="flex items-start gap-2.5 text-sm">
                      <History className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-slate-700">
                          <span className="font-medium">{h.changed_by_name}</span> changed{" "}
                          <span className="font-mono text-xs">{h.field_changed}</span>
                          {h.old_value && <> from <span className="font-mono text-xs">{h.old_value}</span></>}{" "}
                          to <span className="font-mono text-xs">{h.new_value}</span>
                        </p>
                        <p className="text-xs text-slate-400">{format(parseISO(h.changed_at), "PPp")}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar — actions */}
        <div className="space-y-6">
          {canAct && (
            <Card>
              <CardHeader>
                <CardTitle>{t.caseDetail.actions}</CardTitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {!data.assignee_id && (
                  <Button variant="outline" className="w-full" onClick={handleAssignToMe} isLoading={actionLoading}>
                    {t.caseDetail.assignToMe}
                  </Button>
                )}
                {data.status === "open" && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleStatusChange("in_review")}
                    isLoading={actionLoading}
                  >
                    {t.caseDetail.moveToReview}
                  </Button>
                )}
                {data.status === "in_review" && !resolveOpen && (
                  <Button variant="secondary" className="w-full" onClick={() => setResolveOpen(true)}>
                    {t.caseDetail.markResolved}
                  </Button>
                )}
                {resolveOpen && (
                  <div className="space-y-2 rounded-md border border-line p-3">
                    <Textarea
                      rows={3}
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      placeholder={t.caseDetail.resolutionPlaceholder}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        isLoading={actionLoading}
                        onClick={() => handleStatusChange("resolved", resolutionSummary)}
                      >
                        {t.caseDetail.confirm}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setResolveOpen(false)}>
                        {t.caseDetail.cancel}
                      </Button>
                    </div>
                  </div>
                )}
                {data.status === "resolved" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange("archived")}
                    isLoading={actionLoading}
                  >
                    {t.caseDetail.archive}
                  </Button>
                )}

                {!data.is_escalated && !escalateOpen && (
                  <Button variant="danger" className="w-full" onClick={() => setEscalateOpen(true)}>
                    {t.caseDetail.escalate}
                  </Button>
                )}
                {escalateOpen && (
                  <form onSubmit={handleEscalate} className="space-y-2 rounded-md border border-danger-line p-3">
                    <Textarea
                      rows={3}
                      label={t.caseDetail.escalateReason}
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      placeholder={t.caseDetail.escalateReasonPlaceholder}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" variant="danger" className="flex-1" isLoading={actionLoading}>
                        {t.caseDetail.confirmEscalate}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEscalateOpen(false)}>
                        {t.caseDetail.cancel}
                      </Button>
                    </div>
                  </form>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody className="space-y-3 text-sm">
              <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label={t.cases.assignee} value={data.assignee_name ?? t.cases.unassigned} />
              <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label={t.caseDetail.processingTime} value={data.processing_time_ms ? `${data.processing_time_ms}ms` : "—"} />
              <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label="Priority" value={t.casePriority[data.priority]} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-slate-500">
        {icon}
        {label}
      </span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
