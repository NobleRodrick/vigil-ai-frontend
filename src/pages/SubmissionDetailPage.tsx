import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Cpu, Gauge, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { submissionsApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import type { SubmissionDetail } from "@/types/api";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { VerdictStamp } from "@/components/ui/VerdictStamp";
import { PageLoading, ErrorState } from "@/components/ui/Feedback";
import { IndicatorChips, MediaPreview, SubScoreBars } from "@/components/ui/AnalysisExtras";

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();

  const [data, setData] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await submissionsApi.get(id);
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

  const analysis = data.analysis;
  const explanation = analysis ? (lang === "fr" ? analysis.explanation_fr : analysis.explanation_en) : null;
  const hasCase = analysis?.classification && analysis.classification !== "safe" && (analysis.risk_score ?? 0) >= 30;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/submissions" className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.nav.submit}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-semibold text-slate-900">{data.case_number}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.submitted_by_name ?? "—"} · {format(parseISO(data.created_at), "PPp")}
          </p>
        </div>
        <VerdictStamp
          classification={analysis?.classification ?? null}
          score={analysis?.risk_score ?? null}
          size="lg"
        />
      </div>

      <Card className="mb-6">
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
            <a href={data.content_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-navy-600 hover:underline">
              <LinkIcon className="h-3.5 w-3.5" />
              {data.content_url}
            </a>
          )}
          <MediaPreview contentType={data.content_type} url={data.content_url} />
          {data.file_name && <p className="text-sm text-slate-600">{data.file_name}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.caseDetail.analysisResult}</CardTitle>
        </CardHeader>
        <CardBody>
          {!analysis || analysis.risk_score === null ? (
            <p className="text-sm text-slate-400">{t.caseDetail.notAnalyzedYet}</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <Metric icon={<Gauge className="h-3.5 w-3.5" />} label={t.caseDetail.riskScore} value={`${analysis.risk_score}/100`} />
                <Metric
                  icon={<Gauge className="h-3.5 w-3.5" />}
                  label={t.caseDetail.confidence}
                  value={analysis.confidence !== null ? `${Math.round(analysis.confidence * 100)}%` : "—"}
                />
                <Metric icon={<Cpu className="h-3.5 w-3.5" />} label={t.caseDetail.engine} value={analysis.engine_used ?? "—"} />
              </div>
              <SubScoreBars subScores={analysis.sub_scores} />
              <IndicatorChips indicators={analysis.key_indicators} />
              {explanation && (
                <p className="rounded-md border border-line bg-paper-50 p-3 text-sm leading-relaxed text-slate-700">
                  {explanation}
                </p>
              )}
              {hasCase && (
                <Link
                  to={`/cases?search=${data.case_number}`}
                  className="inline-block text-sm font-medium text-navy-600 hover:underline"
                >
                  {t.caseDetail.viewInvestigationCase} →
                </Link>
              )}
            </div>
          )}
        </CardBody>
      </Card>
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
