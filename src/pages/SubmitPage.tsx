import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { submissionsApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { SubmissionQueuedResponse } from "@/types/api";

type Tab = "text" | "image" | "video" | "audio";

export default function SubmitPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("text");
  const [result, setResult] = useState<SubmissionQueuedResponse | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "text", label: t.submit.text, icon: FileText },
    { key: "image", label: t.submit.image, icon: ImageIcon },
    { key: "video", label: t.submit.video, icon: Video },
    { key: "audio", label: t.submit.audio, icon: Mic },
  ];

  if (result) {
    return <SuccessPanel result={result} onReset={() => setResult(null)} />;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-line bg-paper-0 p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-navy-700 text-white"
                : "text-slate-500 hover:bg-paper-50 hover:text-slate-700"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardBody>
          {tab === "text" && <TextForm onSuccess={setResult} />}
          {tab === "image" && <FileForm kind="image" onSuccess={setResult} />}
          {tab === "video" && <VideoForm onSuccess={setResult} />}
          {tab === "audio" && <FileForm kind="audio" onSuccess={setResult} />}
        </CardBody>
      </Card>
    </div>
  );
}

function SuccessPanel({
  result,
  onReset,
}: {
  result: SubmissionQueuedResponse;
  onReset: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-safe-bg text-safe-ink">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{t.submit.successTitle}</h2>
      <p className="mt-2 text-sm text-slate-500">
        <span className="font-mono font-medium text-slate-700">{result.case_number}</span>{" "}
        {t.submit.successMessage}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" onClick={onReset}>
          {t.submit.submitAnother}
        </Button>
        <Link to={`/submissions/${result.submission_id}`}>
          <Button>{t.submit.viewCase}</Button>
        </Link>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ── TEXT FORM ───────────────────────────────────────────────────
function TextForm({ onSuccess }: { onSuccess: (r: SubmissionQueuedResponse) => void }) {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("auto");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (content.trim().length < 10) {
      setError(t.common.required);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submissionsApi.submitText({
        content_text: content,
        language: language === "auto" ? undefined : language,
        source_url: sourceUrl || undefined,
        analyst_notes: notes || undefined,
      });
      onSuccess(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <Textarea
        label={t.submit.textLabel}
        required
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t.submit.textPlaceholder}
        hint={`${content.length} / 50 000`}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select label={t.submit.language} value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="auto">{t.submit.auto}</option>
          <option value="fr">{t.submit.french}</option>
          <option value="en">{t.submit.english}</option>
        </Select>
        <Input
          label={t.submit.sourceUrl}
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://…"
        />
      </div>
      <Textarea
        label={t.submit.notes}
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t.submit.notesPlaceholder}
      />
      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        {isSubmitting ? t.submit.submitting : t.submit.submitButton}
      </Button>
    </form>
  );
}

// ── FILE FORM (image / audio) ──────────────────────────────────
function FileForm({
  kind,
  onSuccess,
}: {
  kind: "image" | "audio";
  onSuccess: (r: SubmissionQueuedResponse) => void;
}) {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accept = kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "audio/mpeg,audio/wav,audio/ogg";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError(t.common.required);
      return;
    }
    setIsSubmitting(true);
    try {
      const extra = { source_url: sourceUrl || undefined, analyst_notes: notes || undefined };
      const res =
        kind === "image"
          ? await submissionsApi.submitImage(file, extra)
          : await submissionsApi.submitAudio(file, extra);
      onSuccess(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {kind === "image" ? t.submit.uploadImage : t.submit.uploadAudio}
          <span className="ml-0.5 text-danger-ink">*</span>
        </label>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) setFile(dropped);
          }}
          className={clsx(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
            isDragging ? "border-navy-500 bg-navy-50" : "border-line hover:bg-paper-50"
          )}
        >
          <UploadCloud className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
          {file ? (
            <p className="text-sm font-medium text-slate-700">{file.name}</p>
          ) : (
            <p className="text-sm text-slate-500">{t.submit.dragDrop}</p>
          )}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Input
        label={t.submit.sourceUrl}
        type="url"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="https://…"
      />
      <Textarea
        label={t.submit.notes}
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t.submit.notesPlaceholder}
      />
      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        {isSubmitting ? t.submit.submitting : t.submit.submitButton}
      </Button>
    </form>
  );
}

// ── VIDEO FORM ──────────────────────────────────────────────────
function VideoForm({ onSuccess }: { onSuccess: (r: SubmissionQueuedResponse) => void }) {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url.trim()) {
      setError(t.common.required);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submissionsApi.submitVideo({
        content_url: url,
        source_url: sourceUrl || undefined,
        analyst_notes: notes || undefined,
      });
      onSuccess(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <Input
        label={t.submit.videoUrl}
        required
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=…"
        hint={t.submit.videoUrlHelp}
      />
      <Input
        label={t.submit.sourceUrl}
        type="url"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="https://…"
      />
      <Textarea
        label={t.submit.notes}
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t.submit.notesPlaceholder}
      />
      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        {isSubmitting ? t.submit.submitting : t.submit.submitButton}
      </Button>
    </form>
  );
}
