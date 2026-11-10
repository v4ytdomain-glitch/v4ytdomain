const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

type ApiErrorBody = { error?: { message?: string }; detail?: string };
let refreshInFlight: Promise<string | null> | null = null;
const getToken = () => localStorage.getItem("v4yt_token");
const setTokenPair = (data: { access_token: string; refresh_token?: string }) => {
  localStorage.setItem("v4yt_token", data.access_token);
  if (data.refresh_token) localStorage.setItem("v4yt_refresh", data.refresh_token);
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("v4yt_refresh");
  if (!refreshToken) return null;
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).then(async response => {
      if (!response.ok) throw new Error("Session expired");
      const pair = await response.json();
      setTokenPair(pair);
      return pair.access_token as string;
    }).catch(() => {
      localStorage.removeItem("v4yt_token");
      localStorage.removeItem("v4yt_refresh");
      return null;
    }).finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

async function request<T>(endpoint: string, init: RequestInit = {}, retry = true, unwrapItems = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof URLSearchParams)) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...init, headers });
  const noRefresh = ["/auth/token", "/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].includes(endpoint.split("?")[0]);
  if (response.status === 401 && retry && !noRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(endpoint, init, false, unwrapItems);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    throw new Error(body.error?.message || body.detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json();
  return (unwrapItems && payload && Array.isArray(payload.items) ? payload.items : payload) as T;
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint),
  getPage: <T = any>(endpoint: string) => request<T>(endpoint, {}, true, false),
  post: <T = any>(endpoint: string, data: unknown) => request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T = any>(endpoint: string, data: unknown) => request<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  login: async (data: URLSearchParams) => {
    const response = await fetch(`${BASE_URL}/auth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data });
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as ApiErrorBody;
      throw new Error(body.error?.message || body.detail || "Login failed");
    }
    const pair = await response.json();
    setTokenPair(pair);
    return pair;
  },
  logout: async () => {
    const refresh_token = localStorage.getItem("v4yt_refresh");
    if (refresh_token) await request("/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token }) }, false).catch(() => undefined);
    localStorage.removeItem("v4yt_token");
    localStorage.removeItem("v4yt_refresh");
  },
};
