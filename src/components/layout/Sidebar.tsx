import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  UploadCloud,
  Inbox,
  FolderSearch,
  FileBarChart,
  Users,
  ScrollText,
  Settings,
  ShieldHalf,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles?: Array<"admin" | "analyst" | "viewer">;
}

export function Sidebar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const role = user?.role.name ?? "viewer";

  const items: NavItem[] = [
    { to: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/submit", label: t.nav.submit, icon: UploadCloud, roles: ["admin", "analyst"] },
    { to: "/submissions", label: t.nav.submissions, icon: Inbox, roles: ["admin", "analyst"] },
    { to: "/cases", label: t.nav.cases, icon: FolderSearch },
    { to: "/reports", label: t.nav.reports, icon: FileBarChart },
    { to: "/users", label: t.nav.users, icon: Users, roles: ["admin"] },
    { to: "/audit-log", label: t.nav.auditLog, icon: ScrollText, roles: ["admin"] },
  ];

  const visibleItems = items.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-ink-950 text-slate-300">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <ShieldHalf className="h-6 w-6 text-navy-100" strokeWidth={1.75} />
        <div className="leading-tight">
          <p className="font-mono text-[13px] font-semibold tracking-wide text-white">VIGIL-AI</p>
          <p className="text-[11px] text-slate-400">Cameroun</p>
        </div>
      </div>
      <div className="tricolor-rule mx-5 rounded-full" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5 scrollbar-thin">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ink-700 text-white"
                  : "text-slate-400 hover:bg-ink-900 hover:text-slate-100"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings link pinned to bottom */}
      <div className="border-t border-ink-800 px-3 py-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-ink-700 text-white"
                : "text-slate-400 hover:bg-ink-900 hover:text-slate-100"
            )
          }
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {t.nav.settings}
        </NavLink>
      </div>
    </aside>
  );
}
