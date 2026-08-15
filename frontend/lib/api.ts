const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  register: (email: string, password: string, organization_name: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, organization_name }),
    }),

  listAssets: () => request("/assets"),

  createAsset: (type: string, value: string, environment: string) =>
    request("/assets", { method: "POST", body: JSON.stringify({ type, value, environment }) }),

  createScan: (asset_id: string, scanner: string = "nmap") =>
    request("/scans", { method: "POST", body: JSON.stringify({ asset_id, scanner }) }),

  listFindings: () => request("/findings"),
};
