import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoading } from "@/components/ui/Feedback";

// Route-level code splitting: each page is its own chunk, loaded on demand.
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const SubmitPage = lazy(() => import("@/pages/SubmitPage"));
const SubmissionsPage = lazy(() => import("@/pages/SubmissionsPage"));
const SubmissionDetailPage = lazy(() => import("@/pages/SubmissionDetailPage"));
const CasesPage = lazy(() => import("@/pages/CasesPage"));
const CaseDetailPage = lazy(() => import("@/pages/CaseDetailPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const AuditLogPage = lazy(() => import("@/pages/AuditLogPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected app shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route
                  path="/submit"
                  element={
                    <ProtectedRoute roles={["admin", "analyst"]}>
                      <SubmitPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/submissions"
                  element={
                    <ProtectedRoute roles={["admin", "analyst"]}>
                      <SubmissionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/submissions/:id"
                  element={
                    <ProtectedRoute roles={["admin", "analyst"]}>
                      <SubmissionDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/cases" element={<CasesPage />} />
                <Route path="/cases/:id" element={<CaseDetailPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit-log"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AuditLogPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
