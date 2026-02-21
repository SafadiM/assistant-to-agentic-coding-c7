import type { Config, CreateConfigDto, UpdateConfigDto } from "../types/config.js";

const BASE = "/configs";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = { ...init?.headers };
  if (init?.body) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getAllConfigs(): Promise<Config[]> {
  return request<Config[]>(BASE);
}

export function getConfig(key: string): Promise<Config> {
  return request<Config>(`${BASE}/${encodeURIComponent(key)}`);
}

export function createConfig(body: CreateConfigDto): Promise<Config> {
  return request<Config>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateConfig(key: string, body: UpdateConfigDto): Promise<Config> {
  return request<Config>(`${BASE}/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteConfig(key: string): Promise<void> {
  return request<void>(`${BASE}/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}
