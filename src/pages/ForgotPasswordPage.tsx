import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ShieldHalf, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <ShieldHalf className="h-7 w-7 text-navy-700" strokeWidth={1.5} />
          <p className="font-mono text-base font-semibold text-ink-950">VIGIL-AI Cameroun</p>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900">{t.auth.resetTitle}</h2>
        <p className="mt-1.5 text-sm text-slate-500">{t.auth.resetSubtitle}</p>

        {sent ? (
          <div className="mt-8 flex items-start gap-3 rounded-md border border-safe-line bg-safe-bg px-4 py-3.5 text-sm text-safe-ink">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{t.auth.resetSent}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink">
                {error}
              </div>
            )}
            <Input
              id="email"
              label={t.auth.email}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@antic.cm"
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              {t.auth.sendResetLink}
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center gap-1.5 text-sm text-navy-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.auth.backToLogin}
        </Link>
      </div>
    </div>
  );
}
