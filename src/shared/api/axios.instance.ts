import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '@/shared/lib/token.storage';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { RefreshResponseEnvelope } from '@/shared/types/api.types';

// ── Axios instance ──────────────────────────────────────────

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Request interceptor — attach Bearer token ───────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Mutex / queue for token refresh ─────────────────────────
//
// When multiple requests hit 401 simultaneously:
//   1. The FIRST 401 acquires the lock and calls /auth/refresh.
//   2. Every subsequent 401 is queued (pending promise).
//   3. Once refresh resolves → all queued requests are retried
//      with the new token.
//   4. If refresh fails → all queued requests are rejected and
//      the user is logged out.
// ─────────────────────────────────────────────────────────────

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((entry) => {
    if (token) {
      entry.resolve(token);
    } else {
      entry.reject(error);
    }
  });
  failedQueue = [];
}

function enqueueRetry(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Use a raw axios call (NOT the `api` instance) to avoid
  // triggering our own interceptors on the refresh request.
  const base = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1';

  const { data } = await axios.post<RefreshResponseEnvelope>(
    `${base}/auth/refresh`,
    { refresh_token: refreshToken },
  );

  const { access_token, refresh_token } = data.data;
  tokenStorage.setTokens(access_token, refresh_token);
  return access_token;
}

function forceLogout(): void {
  // Clear both tokens AND the persisted Zustand state — otherwise
  // the next page load would rehydrate stale `user`/`isAuthenticated`
  // from localStorage and the user would appear logged in with no token.
  useAuthStore.getState().logout();
  // Navigate to login — use window.location to guarantee a full
  // state reset regardless of router context.
  window.location.href = '/login';
}

// ── Response interceptor — handle 401 + refresh ─────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401s that haven't already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh call
    if (originalRequest.url?.includes('/auth/refresh')) {
      forceLogout();
      return Promise.reject(error);
    }

    // Don't try to refresh for the login endpoint
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      const newToken = await enqueueRetry();
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return api(originalRequest);
    }

    // Acquire the lock — this request drives the refresh
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
