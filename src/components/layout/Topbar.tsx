import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Globe, LogOut, Wifi, WifiOff } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface TopbarProps {
  title: string;
  subtitle?: string;
  isLive: boolean;
}

export function Topbar({ title, subtitle, isLive }: TopbarProps) {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = (user?.full_name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-0 px-6">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Live connection indicator */}
        <div
          className={clsx(
            "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:flex",
            isLive
              ? "border-safe-line bg-safe-bg text-safe-ink"
              : "border-line bg-paper-100 text-slate-500"
          )}
          title={isLive ? t.common.connectionLive : t.common.connectionOffline}
        >
          {isLive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isLive ? t.common.connectionLive : t.common.connectionOffline}
        </div>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-600 hover:bg-paper-50"
          aria-label="Toggle language"
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === "fr" ? "FR" : "EN"}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-paper-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="hidden text-left leading-tight md:block">
              <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
              <p className="text-xs text-slate-500">
                {user ? t.roles[user.role.name] : ""}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-md border border-line bg-paper-0 py-1 shadow-lg">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-paper-50"
              >
                <LogOut className="h-4 w-4" />
                {t.nav.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
