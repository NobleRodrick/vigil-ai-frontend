import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldHalf, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t.auth.invalidResetLink);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.confirmPasswordReset(token, newPassword);
      setSuccess(true);
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

        <h2 className="text-2xl font-semibold text-slate-900">{t.auth.resetPasswordTitle}</h2>

        {!token ? (
          <div className="mt-8 flex items-start gap-3 rounded-md border border-danger-line bg-danger-bg px-4 py-3.5 text-sm text-danger-ink">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{t.auth.invalidResetLink}</span>
          </div>
        ) : success ? (
          <div className="mt-8 flex items-start gap-3 rounded-md border border-safe-line bg-safe-bg px-4 py-3.5 text-sm text-safe-ink">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{t.auth.resetPasswordSuccess}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink">
                {error}
              </div>
            )}
            <Input
              id="newPassword"
              label={t.settings.newPassword}
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="≥10 chars, upper+lower+digit+symbol"
            />
            <Input
              id="confirmPassword"
              label={t.auth.confirmNewPassword}
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              {t.auth.resetPasswordButton}
            </Button>
          </form>
        )}

        <Link to="/login" className="mt-6 inline-block text-sm text-navy-600 hover:underline">
          {t.auth.backToLogin}
        </Link>
      </div>
    </div>
  );
}
