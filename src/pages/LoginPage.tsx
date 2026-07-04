import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { ShieldHalf, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, t.auth.invalidCredentials));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink-950 px-12 py-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <svg width="100%" height="100%">
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <ShieldHalf className="h-8 w-8 text-navy-100" strokeWidth={1.5} />
          <div>
            <p className="font-mono text-lg font-semibold tracking-wide">VIGIL-AI</p>
            <p className="text-sm text-slate-400">Cameroun</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-2xl font-light leading-snug text-slate-100">
            {lang === "fr"
              ? "Protéger le cyberespace camerounais contre les abus de l'intelligence artificielle."
              : "Protecting Cameroonian cyberspace from the excesses of artificial intelligence."}
          </p>
          <div className="tricolor-rule mt-6 w-24 rounded-full" />
          <p className="mt-6 text-sm text-slate-400">
            {lang === "fr"
              ? "Protéger le cyberespace camerounais contre les abus de l'intelligence artificielle."
              : "Safeguarding Cameroon's cyberspace through AI content monitoring and analysis."}
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © 2026 VIGIL-AI Cameroun
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper-50 px-6 py-12">
        <div className="absolute right-6 top-6">
          <button
            onClick={toggleLang}
            className="rounded-md border border-line bg-paper-0 px-3 py-1.5 text-xs font-semibold uppercase text-slate-600 hover:bg-paper-100"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <ShieldHalf className="h-7 w-7 text-navy-700" strokeWidth={1.5} />
            <p className="font-mono text-base font-semibold text-ink-950">VIGIL-AI Cameroun</p>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">{t.auth.welcomeBack}</h2>
          <p className="mt-1.5 text-sm text-slate-500">{t.auth.loginSubtitle}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              id="email"
              label={t.auth.email}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@antic.cm"
            />
            <Input
              id="password"
              label={t.auth.password}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              {isSubmitting ? t.auth.loggingIn : t.auth.loginButton}
            </Button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-navy-600 hover:underline">
                {t.auth.forgotPassword}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
