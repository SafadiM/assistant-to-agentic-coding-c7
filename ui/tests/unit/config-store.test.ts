import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/api/config-api.js", () => ({
  getAllConfigs: vi.fn(),
  getConfig: vi.fn(),
  createConfig: vi.fn(),
  updateConfig: vi.fn(),
  deleteConfig: vi.fn(),
}));

import * as configApi from "../../src/api/config-api.js";
import { store } from "../../src/state/config-store.js";

const api = vi.mocked(configApi);

const sampleConfig = {
  id: "uuid-1",
  key: "site_name",
  value: "My App",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

describe("ConfigStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has the correct initial state", () => {
    const state = store.getState();
    expect(state).toHaveProperty("loading");
    expect(state).toHaveProperty("error");
    expect(state).toHaveProperty("configs");
    expect(state).toHaveProperty("selectedConfig");
  });

  it("returns a frozen state snapshot", () => {
    const state = store.getState();
    expect(Object.isFrozen(state)).toBe(true);
  });

  describe("loadConfigs", () => {
    it("fetches configs and updates state", async () => {
      api.getAllConfigs.mockResolvedValue([sampleConfig]);

      const changed = new Promise<void>((resolve) => {
        const handler = () => {
          const s = store.getState();
          if (!s.loading && s.configs.length > 0) {
            store.removeEventListener("state-change", handler);
            resolve();
          }
        };
        store.addEventListener("state-change", handler);
      });

      await store.loadConfigs();
      await changed;

      const state = store.getState();
      expect(state.configs).toHaveLength(1);
      expect(state.configs[0].key).toBe("site_name");
      expect(state.loading).toBe(false);
    });

    it("sets error state on API failure", async () => {
      api.getAllConfigs.mockRejectedValue(new Error("Network error"));

      await store.loadConfigs();

      const state = store.getState();
      expect(state.error).toBe("Network error");
      expect(state.loading).toBe(false);
    });

    it("dispatches state-change events", async () => {
      api.getAllConfigs.mockResolvedValue([]);
      const handler = vi.fn();
      store.addEventListener("state-change", handler);

      await store.loadConfigs();

      store.removeEventListener("state-change", handler);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("loadConfig", () => {
    it("fetches a single config by key", async () => {
      api.getConfig.mockResolvedValue(sampleConfig);

      await store.loadConfig("site_name");

      const state = store.getState();
      expect(state.selectedConfig).toEqual(sampleConfig);
      expect(state.loading).toBe(false);
    });
  });

  describe("createConfig", () => {
    it("calls createConfig API and refreshes the list", async () => {
      api.createConfig.mockResolvedValue(sampleConfig);
      api.getAllConfigs.mockResolvedValue([sampleConfig]);

      await store.createConfig({ key: "site_name", value: "My App" });

      expect(api.createConfig).toHaveBeenCalledWith({ key: "site_name", value: "My App" });
      expect(api.getAllConfigs).toHaveBeenCalled();
    });

    it("sets error and rethrows on failure", async () => {
      api.createConfig.mockRejectedValue(new Error("409: duplicate key"));

      await expect(
        store.createConfig({ key: "site_name", value: "My App" })
      ).rejects.toThrow("409");

      const state = store.getState();
      expect(state.error).toContain("409");
    });
  });

  describe("updateConfig", () => {
    it("calls updateConfig API and refreshes the list", async () => {
      api.updateConfig.mockResolvedValue({ ...sampleConfig, value: "Updated" });
      api.getAllConfigs.mockResolvedValue([{ ...sampleConfig, value: "Updated" }]);

      await store.updateConfig("site_name", { value: "Updated" });

      expect(api.updateConfig).toHaveBeenCalledWith("site_name", { value: "Updated" });
      expect(api.getAllConfigs).toHaveBeenCalled();
    });
  });

  describe("deleteConfig", () => {
    it("calls deleteConfig API and refreshes the list", async () => {
      api.deleteConfig.mockResolvedValue(undefined);
      api.getAllConfigs.mockResolvedValue([]);

      await store.deleteConfig("site_name");

      expect(api.deleteConfig).toHaveBeenCalledWith("site_name");
      expect(api.getAllConfigs).toHaveBeenCalled();
    });

    it("sets error and rethrows on failure", async () => {
      api.deleteConfig.mockRejectedValue(new Error("404: not found"));

      await expect(store.deleteConfig("missing")).rejects.toThrow("404");

      const state = store.getState();
      expect(state.error).toContain("404");
    });
  });
});
