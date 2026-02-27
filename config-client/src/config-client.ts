import type { Config, CreateConfigDto, UpdateConfigDto, HealthStatus } from "./types.js";
import {
  ConfigClientError,
  ConfigNotFoundError,
  ConfigConflictError,
  ConfigValidationError,
} from "./errors.js";

export interface ConfigClientOptions {
  baseUrl: string;
  /** Custom fetch implementation (defaults to global fetch). */
  fetch?: typeof globalThis.fetch;
}

export class ConfigClient {
  private readonly baseUrl: string;
  private readonly customFetch?: typeof globalThis.fetch;

  constructor(options: ConfigClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.customFetch = options.fetch;
  }

  private get fetch(): typeof globalThis.fetch {
    return this.customFetch ?? globalThis.fetch.bind(globalThis);
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.request<HealthStatus>("/health");
  }

  async getAll(): Promise<Config[]> {
    return this.request<Config[]>("/configs");
  }

  async get(key: string): Promise<Config> {
    return this.request<Config>(`/configs/${encodeURIComponent(key)}`);
  }

  async create(dto: CreateConfigDto): Promise<Config> {
    return this.request<Config>("/configs", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async update(key: string, dto: UpdateConfigDto): Promise<Config> {
    return this.request<Config>(`/configs/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  }

  async delete(key: string): Promise<void> {
    await this.request<void>(`/configs/${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {};
    if (init?.body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await this.fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string>) },
    });

    if (!res.ok) {
      const contextKey = this.extractKeyFromPath(path) ?? this.extractKeyFromBody(init?.body);
      await this.handleErrorResponse(res, contextKey);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private async handleErrorResponse(res: Response, key: string | null): Promise<never> {
    const body = await res.text();

    if (res.status === 404 && key) {
      throw new ConfigNotFoundError(key);
    }

    if (res.status === 409 && key) {
      throw new ConfigConflictError(key);
    }

    if (res.status === 400) {
      try {
        const parsed = JSON.parse(body);
        if (parsed.details) {
          throw new ConfigValidationError(parsed.error ?? "Validation failed", parsed.details);
        }
      } catch (err) {
        if (err instanceof ConfigValidationError) throw err;
      }
    }

    throw new ConfigClientError(`Request failed: ${res.status}`, res.status, body);
  }

  private extractKeyFromPath(path: string): string | null {
    const match = path.match(/^\/configs\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  private extractKeyFromBody(body: RequestInit["body"]): string | null {
    if (typeof body !== "string") return null;
    try {
      const parsed = JSON.parse(body);
      return typeof parsed.key === "string" ? parsed.key : null;
    } catch {
      return null;
    }
  }
}
