// VIGIL-AI Cameroun — API Endpoint Functions

import { api, tokenStore } from "@/lib/api";
import type {
  CaseDetail,
  CaseHistoryEntry,
  CaseNote,
  CaseSummary,
  ContentTypeBreakdown,
  DashboardOverview,
  LoginResponse,
  Paginated,
  RiskDistribution,
  SubmissionDetail,
  SubmissionQueuedResponse,
  SubmissionSummary,
  TimelinePoint,
  User,
} from "@/types/api";

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    tokenStore.set(data.access_token, data.refresh_token);
    return data;
  },
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      tokenStore.clear();
    }
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post("/auth/password-reset/request", { email });
  },
  confirmPasswordReset: async (token: string, new_password: string): Promise<void> => {
    await api.post("/auth/password-reset/confirm", { token, new_password });
  },
  changePassword: async (current_password: string, new_password: string): Promise<void> => {
    await api.post("/auth/change-password", { current_password, new_password });
  },
};

// ── Submissions ──────────────────────────────────────────────
export const submissionsApi = {
  submitText: async (payload: {
    content_text: string;
    language?: string;
    source_url?: string;
    analyst_notes?: string;
  }): Promise<SubmissionQueuedResponse> => {
    const { data } = await api.post("/submissions/text", payload);
    return data;
  },
  submitImage: async (
    file: File,
    extra: { source_url?: string; analyst_notes?: string }
  ): Promise<SubmissionQueuedResponse> => {
    const form = new FormData();
    form.append("file", file);
    if (extra.source_url) form.append("source_url", extra.source_url);
    if (extra.analyst_notes) form.append("analyst_notes", extra.analyst_notes);
    const { data } = await api.post("/submissions/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  submitAudio: async (
    file: File,
    extra: { source_url?: string; analyst_notes?: string }
  ): Promise<SubmissionQueuedResponse> => {
    const form = new FormData();
    form.append("file", file);
    if (extra.source_url) form.append("source_url", extra.source_url);
    if (extra.analyst_notes) form.append("analyst_notes", extra.analyst_notes);
    const { data } = await api.post("/submissions/audio", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  submitVideo: async (payload: {
    content_url: string;
    source_url?: string;
    analyst_notes?: string;
  }): Promise<SubmissionQueuedResponse> => {
    const { data } = await api.post("/submissions/video", payload);
    return data;
  },
  list: async (params: {
    page?: number;
    page_size?: number;
    content_type?: string;
    status?: string;
    my_only?: boolean;
  }): Promise<Paginated<SubmissionSummary>> => {
    const { data } = await api.get("/submissions/", { params });
    return data;
  },
  get: async (id: string): Promise<SubmissionDetail> => {
    const { data } = await api.get(`/submissions/${id}`);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/submissions/${id}`);
  },
};

// ── Cases ────────────────────────────────────────────────────
export const casesApi = {
  list: async (params: {
    page?: number;
    page_size?: number;
    status?: string;
    classification?: string;
    content_type?: string;
    assigned_to_me?: boolean;
    search?: string;
  }): Promise<Paginated<CaseSummary>> => {
    const { data } = await api.get("/cases/", { params });
    return data;
  },
  get: async (id: string): Promise<CaseDetail> => {
    const { data } = await api.get(`/cases/${id}`);
    return data;
  },
  updateStatus: async (
    id: string,
    status: string,
    resolution_summary?: string
  ): Promise<void> => {
    await api.patch(`/cases/${id}/status`, { status, resolution_summary });
  },
  assign: async (id: string, analyst_id: string | null): Promise<void> => {
    await api.patch(`/cases/${id}/assign`, { analyst_id });
  },
  addNote: async (id: string, content: string): Promise<CaseNote> => {
    const { data } = await api.post(`/cases/${id}/notes`, { content });
    return data;
  },
  listNotes: async (id: string): Promise<CaseNote[]> => {
    const { data } = await api.get(`/cases/${id}/notes`);
    return data;
  },
  escalate: async (id: string, reason: string): Promise<void> => {
    await api.post(`/cases/${id}/escalate`, { reason });
  },
  exportCsv: async (status?: string): Promise<Blob> => {
    const { data } = await api.get("/cases/export/csv", {
      params: { status },
      responseType: "blob",
    });
    return data;
  },
};

// ── Analytics ────────────────────────────────────────────────
export const analyticsApi = {
  overview: async (): Promise<DashboardOverview> => {
    const { data } = await api.get("/analytics/overview");
    return data;
  },
  timeline: async (days = 30): Promise<TimelinePoint[]> => {
    const { data } = await api.get("/analytics/timeline", { params: { days } });
    return data;
  },
  byType: async (): Promise<ContentTypeBreakdown> => {
    const { data } = await api.get("/analytics/by-type");
    return data;
  },
  riskDistribution: async (): Promise<RiskDistribution> => {
    const { data } = await api.get("/analytics/risk-distribution");
    return data;
  },
};

// ── Users (Admin) ────────────────────────────────────────────
export const usersApi = {
  list: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    role?: string;
    is_active?: boolean;
  }): Promise<Paginated<User>> => {
    const { data } = await api.get("/users/", { params });
    return data;
  },
  create: async (payload: {
    email: string;
    password: string;
    full_name: string;
    role_name: string;
    organization?: string;
  }): Promise<User> => {
    const { data } = await api.post("/users/", payload);
    return data;
  },
  update: async (
    id: string,
    payload: Partial<{
      full_name: string;
      organization: string;
      role_name: string;
      is_active: boolean;
    }>
  ): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },
  deactivate: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export type { CaseHistoryEntry };
