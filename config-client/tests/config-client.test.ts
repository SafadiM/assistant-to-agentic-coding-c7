import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigClient } from "../src/config-client";
import {
  ConfigClientError,
  ConfigNotFoundError,
  ConfigConflictError,
  ConfigValidationError,
} from "../src/errors";

function mockFetch(status: number, body?: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  });
}

function createClient(fetchImpl: ReturnType<typeof vi.fn>) {
  return new ConfigClient({ baseUrl: "http://localhost:3000", fetch: fetchImpl });
}

describe("ConfigClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("strips trailing slashes from baseUrl", () => {
      const fetch = mockFetch(200, []);
      const client = new ConfigClient({ baseUrl: "http://localhost:3000///", fetch });
      client.getAll();
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/configs", expect.any(Object));
    });
  });

  describe("healthCheck", () => {
    it("returns the health status", async () => {
      const fetch = mockFetch(200, { status: "ok" });
      const client = createClient(fetch);

      const result = await client.healthCheck();
      expect(result).toEqual({ status: "ok" });
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/health", expect.any(Object));
    });
  });

  describe("getAll", () => {
    it("fetches GET /configs and returns Config[]", async () => {
      const configs = [{ id: "1", key: "k", value: "v", createdAt: "", updatedAt: "" }];
      const fetch = mockFetch(200, configs);
      const client = createClient(fetch);

      const result = await client.getAll();
      expect(result).toEqual(configs);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/configs",
        expect.objectContaining({ headers: {} }),
      );
    });

    it("throws ConfigClientError on server error", async () => {
      const fetch = mockFetch(500, "Internal Server Error");
      const client = createClient(fetch);

      await expect(client.getAll()).rejects.toThrow(ConfigClientError);
      await expect(client.getAll()).rejects.toThrow("500");
    });
  });

  describe("get", () => {
    it("fetches GET /configs/:key and returns a Config", async () => {
      const config = { id: "1", key: "site_name", value: "My App", createdAt: "", updatedAt: "" };
      const fetch = mockFetch(200, config);
      const client = createClient(fetch);

      const result = await client.get("site_name");
      expect(result).toEqual(config);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/configs/site_name",
        expect.any(Object),
      );
    });

    it("encodes the key parameter", async () => {
      const fetch = mockFetch(200, {});
      const client = createClient(fetch);

      await client.get("key with spaces");
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/configs/key%20with%20spaces",
        expect.any(Object),
      );
    });

    it("throws ConfigNotFoundError on 404", async () => {
      const fetch = mockFetch(404, { error: 'Config with key "missing" not found' });
      const client = createClient(fetch);

      await expect(client.get("missing")).rejects.toThrow(ConfigNotFoundError);
      await expect(client.get("missing")).rejects.toThrow('"missing"');
    });
  });

  describe("create", () => {
    it("sends POST /configs with JSON body", async () => {
      const created = { id: "2", key: "new_key", value: "val", createdAt: "", updatedAt: "" };
      const fetch = mockFetch(201, created);
      const client = createClient(fetch);

      const result = await client.create({ key: "new_key", value: "val" });
      expect(result).toEqual(created);

      const [url, init] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3000/configs");
      expect(init.method).toBe("POST");
      expect(init.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(init.body)).toEqual({ key: "new_key", value: "val" });
    });

    it("throws ConfigConflictError on 409", async () => {
      const fetch = mockFetch(409, { error: 'Config with key "dup" already exists' });
      const client = createClient(fetch);

      await expect(client.create({ key: "dup", value: "v" })).rejects.toThrow(
        ConfigConflictError,
      );
    });

    it("throws ConfigValidationError on 400 with details", async () => {
      const errorBody = {
        error: "Validation failed",
        details: [{ path: "key", message: "Required" }],
      };
      const fetch = mockFetch(400, errorBody);
      const client = createClient(fetch);

      try {
        await client.create({ key: "", value: "v" });
        expect.unreachable("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ConfigValidationError);
        expect((err as ConfigValidationError).details).toEqual(errorBody.details);
      }
    });
  });

  describe("update", () => {
    it("sends PUT /configs/:key with JSON body", async () => {
      const updated = { id: "1", key: "k", value: "new", createdAt: "", updatedAt: "" };
      const fetch = mockFetch(200, updated);
      const client = createClient(fetch);

      const result = await client.update("k", { value: "new" });
      expect(result).toEqual(updated);

      const [url, init] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3000/configs/k");
      expect(init.method).toBe("PUT");
      expect(JSON.parse(init.body)).toEqual({ value: "new" });
    });

    it("throws ConfigNotFoundError on 404", async () => {
      const fetch = mockFetch(404, { error: "Not found" });
      const client = createClient(fetch);

      await expect(client.update("nope", { value: "x" })).rejects.toThrow(ConfigNotFoundError);
    });
  });

  describe("delete", () => {
    it("sends DELETE /configs/:key and returns void", async () => {
      const fetch = mockFetch(204);
      const client = createClient(fetch);

      const result = await client.delete("k");
      expect(result).toBeUndefined();

      const [url, init] = fetch.mock.calls[0];
      expect(url).toBe("http://localhost:3000/configs/k");
      expect(init.method).toBe("DELETE");
    });

    it("throws ConfigNotFoundError on 404", async () => {
      const fetch = mockFetch(404, { error: "Not found" });
      const client = createClient(fetch);

      await expect(client.delete("nope")).rejects.toThrow(ConfigNotFoundError);
    });
  });
});
