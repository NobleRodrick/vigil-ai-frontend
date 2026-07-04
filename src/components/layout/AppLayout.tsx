import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastStack } from "@/components/ui/ToastStack";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/context/LanguageContext";

const ROUTE_TITLES: Record<string, { key: "dashboard" | "submit" | "cases"; sub?: boolean }> = {
  "/": { key: "dashboard", sub: true },
  "/submit": { key: "submit", sub: true },
  "/cases": { key: "cases", sub: true },
};

export function AppLayout() {
  const { t } = useLanguage();
  const location = useLocation();
  const { isConnected, notifications, dismiss } = useNotifications(true);

  const match = ROUTE_TITLES[location.pathname];
  const title = match ? t[match.key].title : pathToTitle(location.pathname, t);
  const subtitle = match?.sub ? t[match.key].subtitle : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-paper-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} isLive={isConnected} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
      <ToastStack notifications={notifications} onDismiss={dismiss} />
    </div>
  );
}

function pathToTitle(path: string, t: ReturnType<typeof useLanguage>["t"]): string {
  if (path.startsWith("/cases/")) return t.cases.title;
  if (path.startsWith("/users")) return t.users.title;
  if (path.startsWith("/settings")) return t.settings.title;
  if (path.startsWith("/reports")) return t.nav.reports;
  if (path.startsWith("/audit-log")) return t.nav.auditLog;
  return t.app.name;
}
