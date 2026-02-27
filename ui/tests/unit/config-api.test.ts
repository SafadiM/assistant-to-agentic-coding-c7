import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllConfigs,
  getConfig,
  createConfig,
  updateConfig,
  deleteConfig,
} from "../../src/api/config-api";

function mockFetch(status: number, body?: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  });
}

describe("config-api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAllConfigs", () => {
    it("fetches GET /configs and returns Config[]", async () => {
      const configs = [{ id: "1", key: "k", value: "v", createdAt: "", updatedAt: "" }];
      vi.stubGlobal("fetch", mockFetch(200, configs));

      const result = await getAllConfigs();
      expect(result).toEqual(configs);
      expect(fetch).toHaveBeenCalledWith("/configs", expect.objectContaining({ headers: {} }));
    });

    it("throws on non-OK response", async () => {
      vi.stubGlobal("fetch", mockFetch(500, "Internal Server Error"));

      await expect(getAllConfigs()).rejects.toThrow("500");
    });
  });

  describe("getConfig", () => {
    it("fetches GET /configs/:key", async () => {
      const config = { id: "1", key: "site_name", value: "My App", createdAt: "", updatedAt: "" };
      vi.stubGlobal("fetch", mockFetch(200, config));

      const result = await getConfig("site_name");
      expect(result).toEqual(config);
      expect(fetch).toHaveBeenCalledWith("/configs/site_name", expect.any(Object));
    });

    it("encodes the key parameter", async () => {
      vi.stubGlobal("fetch", mockFetch(200, {}));

      await getConfig("key with spaces");
      expect(fetch).toHaveBeenCalledWith(
        "/configs/key%20with%20spaces",
        expect.any(Object)
      );
    });
  });

  describe("createConfig", () => {
    it("sends POST /configs with JSON body", async () => {
      const created = { id: "2", key: "new_key", value: "val", createdAt: "", updatedAt: "" };
      vi.stubGlobal("fetch", mockFetch(201, created));

      const result = await createConfig({ key: "new_key", value: "val" });
      expect(result).toEqual(created);

      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("/configs");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual({ key: "new_key", value: "val" });
      expect(init.headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("updateConfig", () => {
    it("sends PUT /configs/:key with JSON body", async () => {
      const updated = { id: "1", key: "k", value: "new", createdAt: "", updatedAt: "" };
      vi.stubGlobal("fetch", mockFetch(200, updated));

      const result = await updateConfig("k", { value: "new" });
      expect(result).toEqual(updated);

      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("/configs/k");
      expect(init.method).toBe("PUT");
      expect(JSON.parse(init.body)).toEqual({ value: "new" });
    });
  });

  describe("deleteConfig", () => {
    it("sends DELETE /configs/:key and returns void", async () => {
      vi.stubGlobal("fetch", mockFetch(204));

      const result = await deleteConfig("k");
      expect(result).toBeUndefined();

      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("/configs/k");
      expect(init.method).toBe("DELETE");
    });
  });
});
