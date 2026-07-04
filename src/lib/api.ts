// VIGIL-AI Cameroun — API Client
// Axios instance with JWT injection and automatic refresh-on-401.

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types/api";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_V1 = `${API_BASE_URL}/api/v1`;
export const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ||
  API_BASE_URL.replace(/^http/, "ws");

const ACCESS_TOKEN_KEY = "vigilai_access_token";
const REFRESH_TOKEN_KEY = "vigilai_refresh_token";

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const api = axios.create({
  baseURL: API_V1,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach bearer token ──────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: refresh token on 401, retry once ────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${API_V1}/auth/refresh`, {
      refresh_token: refresh,
    });
    tokenStore.set(data.access_token, data.refresh_token);
    return data.access_token as string;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      // Don't try to refresh on the login/refresh endpoints themselves
      if (original.url?.includes("/auth/login") || original.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      // Refresh failed — force logout
      tokenStore.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ── Helper to extract a readable error message ─────────────────
export function getErrorMessage(error: unknown, fallback = "Une erreur est survenue"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.detail) return data.detail;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
