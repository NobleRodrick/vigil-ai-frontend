import { useEffect, useState, type FormEvent } from "react";
import { Activity, CheckCircle2, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { authApi, healthApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import type { HealthStatus } from "@/types/api";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.profile}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">{t.users.fullName}</span>
            <span className="font-medium text-slate-900">{user?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t.users.email}</span>
            <span className="font-medium text-slate-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t.users.role}</span>
            <span className="font-medium text-slate-900">{user ? t.roles[user.role.name] : ""}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t.users.organization}</span>
            <span className="font-medium text-slate-900">{user?.organization ?? "—"}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.language}</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex gap-2">
            <Button variant={lang === "fr" ? "primary" : "outline"} size="sm" onClick={() => setLang("fr")}>
              Français
            </Button>
            <Button variant={lang === "en" ? "primary" : "outline"} size="sm" onClick={() => setLang("en")}>
              English
            </Button>
          </div>
        </CardBody>
      </Card>

      <ChangePasswordCard />

      <SystemStatusCard />
    </div>
  );
}

function SystemStatusCard() {
  const { t } = useLanguage();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setHealth(await healthApi.check());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" strokeWidth={1.75} />
          {t.settings.systemStatus}
        </CardTitle>
        <button
          onClick={load}
          className="rounded p-1 text-slate-400 hover:bg-paper-100 hover:text-slate-600"
          aria-label={t.common.retry}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>
      <CardBody>
        {error ? (
          <p className="text-sm text-danger-ink">{error}</p>
        ) : !health ? (
          <p className="text-sm text-slate-400">{t.common.loading}</p>
        ) : (
          <div className="space-y-2.5 text-sm">
            {Object.entries(health.checks).map(([service, status]) => {
              const ok = status === "ok";
              return (
                <div key={service} className="flex items-center justify-between">
                  <span className="capitalize text-slate-500">{service}</span>
                  <span
                    className={`flex items-center gap-1.5 font-mono text-xs font-semibold uppercase ${
                      ok ? "text-safe-ink" : "text-danger-ink"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${ok ? "bg-safe-ink" : "bg-danger-ink"}`} />
                    {ok ? t.settings.operational : t.settings.unavailable}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t border-line pt-2.5 text-xs text-slate-400">
              <span>v{health.version} · {health.environment}</span>
              <span className="font-mono">{health.status}</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function ChangePasswordCard() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.settings.changePassword}</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink">
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-md border border-safe-line bg-safe-bg px-3 py-2.5 text-sm text-safe-ink">
              <CheckCircle2 className="h-4 w-4" />
              {t.settings.saved}
            </div>
          )}
          <Input
            label={t.settings.currentPassword}
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label={t.settings.newPassword}
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="≥10 chars, upper+lower+digit+symbol"
          />
          <Button type="submit" isLoading={isSubmitting}>
            {t.settings.save}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
