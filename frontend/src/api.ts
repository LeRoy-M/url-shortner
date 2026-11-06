import type { URLRecord, URLListResponse } from "./types";

// Empty string = same origin as the page (works both in dev via Vite proxy and
// in production where FastAPI serves the built frontend at the same host/port).
const BASE = "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function shortenUrl(originalUrl: string): Promise<URLRecord> {
  const res = await fetch(`${BASE}/api/urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original_url: originalUrl }),
  });
  return handleResponse<URLRecord>(res);
}

export async function listUrls(): Promise<URLListResponse> {
  const res = await fetch(`${BASE}/api/urls`);
  return handleResponse<URLListResponse>(res);
}

export async function deleteUrl(shortCode: string): Promise<void> {
  const res = await fetch(`${BASE}/api/urls/${shortCode}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
}
