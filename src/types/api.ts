// VIGIL-AI Cameroun — Shared API Types
// Mirrors the backend Pydantic schemas exactly.

export type Role = "admin" | "analyst" | "viewer";
export type ContentType = "text" | "image" | "video" | "audio";
export type SubmissionStatus = "queued" | "analyzing" | "complete" | "failed";
export type Classification = "safe" | "suspicious" | "malicious";
export type CaseStatus = "open" | "in_review" | "resolved" | "archived";
export type CasePriority = "low" | "medium" | "high" | "critical";

export interface User {
  id: string;
  email: string;
  full_name: string;
  organization: string | null;
  preferred_language: "fr" | "en";
  is_active: boolean;
  is_locked: boolean;
  last_login_at: string | null;
  created_at: string;
  role: { id: string; name: Role; description: string | null };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Analysis {
  id: string;
  submission_id: string;
  risk_score: number | null;
  classification: Classification | null;
  confidence: number | null;
  explanation_fr: string | null;
  explanation_en: string | null;
  engine_used: string | null;
  processing_time_ms: number | null;
  analyzed_at: string | null;
  created_at: string;
  key_indicators: string[] | null;
  sub_scores: Record<string, number> | null;
}

export interface SubmissionSummary {
  id: string;
  case_number: string;
  content_type: ContentType;
  status: SubmissionStatus;
  language: string | null;
  source_url: string | null;
  analyst_notes: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  content_text_preview: string | null;
  created_at: string;
  updated_at: string;
  risk_score: number | null;
  classification: Classification | null;
  fake_news_probability: number | null;
}

export interface SubmissionDetail extends SubmissionSummary {
  submitted_by_name: string | null;
  analysis: Analysis | null;
  content_url: string | null;
}

export interface SubmissionQueuedResponse {
  case_number: string;
  submission_id: string;
  message: string;
  status: string;
}

export interface CaseSummary {
  id: string;
  status: CaseStatus;
  priority: CasePriority;
  is_escalated: boolean;
  created_at: string;
  updated_at: string;
  case_number: string;
  content_type: ContentType;
  risk_score: number | null;
  classification: Classification | null;
  assignee_name: string | null;
}

export interface CaseNote {
  id: string;
  case_id: string;
  content: string;
  created_at: string;
  author_full_name: string | null;
  author_email: string | null;
}

export interface CaseHistoryEntry {
  id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string;
  changed_at: string;
  changed_by_name: string | null;
}

export interface CaseDetail {
  id: string;
  status: CaseStatus;
  priority: CasePriority;
  is_escalated: boolean;
  escalation_reason: string | null;
  resolution_summary: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  submission_id: string;
  case_number: string;
  content_type: ContentType;
  content_text_preview: string | null;
  content_url: string | null;
  file_name: string | null;
  source_url: string | null;
  analyst_notes: string | null;
  language: string | null;
  submitted_at: string;
  submitter_name: string | null;
  risk_score: number | null;
  classification: Classification | null;
  confidence: number | null;
  explanation_fr: string | null;
  explanation_en: string | null;
  engine_used: string | null;
  processing_time_ms: number | null;
  analyzed_at: string | null;
  key_indicators: string[] | null;
  sub_scores: Record<string, number> | null;
  assignee_id: string | null;
  assignee_name: string | null;
  creator_name: string | null;
  notes: CaseNote[];
  history: CaseHistoryEntry[];
}

export interface Paginated<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardOverview {
  total_submissions: number;
  total_cases: number;
  open_cases: number;
  in_review_cases: number;
  resolved_cases: number;
  malicious_cases: number;
  suspicious_cases: number;
  safe_cases: number;
  submissions_today: number;
  cases_today: number;
  malicious_today: number;
}

export interface TimelinePoint {
  date: string;
  total: number;
  malicious: number;
  suspicious: number;
  safe: number;
}

export interface ContentTypeBreakdown {
  text_count: number;
  image_count: number;
  video_count: number;
  audio_count: number;
  text_pct: number;
  image_pct: number;
  video_pct: number;
  audio_pct: number;
}

export interface RiskScoreBucket {
  bucket: string;
  count: number;
}

export interface RiskDistribution {
  buckets: RiskScoreBucket[];
  average_score: number | null;
  median_score: number | null;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | string;
  version: string;
  environment: string;
  timestamp: string;
  checks: Record<string, string>;
}

export interface ApiError {
  detail: string;
  code: string;
}

export interface WebSocketNotification {
  type: "connected" | "ping" | "pong" | "analysis_complete" | string;
  message?: string;
  submission_id?: string;
  case_number?: string;
  risk_score?: number;
  classification?: Classification;
  user_id?: string;
}
