const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("admin_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("admin_token", token);
  else localStorage.removeItem("admin_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
};

export function money(amount: string | number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(amount));
}

export function formatDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return dateValue;
  return `${day}-${month}-${year}`;
}
