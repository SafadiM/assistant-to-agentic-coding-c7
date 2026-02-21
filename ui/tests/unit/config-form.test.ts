import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

vi.mock("../../src/api/config-api.js", () => ({
  getAllConfigs: vi.fn().mockResolvedValue([]),
  getConfig: vi.fn(),
  createConfig: vi.fn(),
  updateConfig: vi.fn(),
  deleteConfig: vi.fn(),
}));

import { ConfigForm } from "../../src/components/config-form.js";
import { store } from "../../src/state/config-store.js";
import * as configApi from "../../src/api/config-api.js";

const api = vi.mocked(configApi);

beforeAll(() => {
  if (!customElements.get("config-form")) {
    customElements.define("config-form", ConfigForm);
  }
});

function createElement(mode: "create" | "edit" = "create", key = ""): ConfigForm {
  const el = document.createElement("config-form") as ConfigForm;
  el.setAttribute("mode", mode);
  if (key) el.setAttribute("config-key", key);
  document.body.appendChild(el);
  return el;
}

function getInput(el: ConfigForm, name: string): HTMLInputElement | HTMLTextAreaElement | null {
  return el.shadowRoot!.querySelector(`[name="${name}"]`);
}

function getError(el: ConfigForm, id: string): HTMLSpanElement | null {
  return el.shadowRoot!.querySelector(`#${id}`);
}

describe("ConfigForm", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("create mode", () => {
    it("renders with create heading and editable key field", () => {
      const el = createElement("create");
      const heading = el.shadowRoot!.querySelector("h2");
      expect(heading?.textContent).toBe("Create Config");

      const keyInput = getInput(el, "key") as HTMLInputElement;
      expect(keyInput.readOnly).toBe(false);
    });

    it("shows key-required error when key is empty", async () => {
      const el = createElement("create");
      const form = el.shadowRoot!.querySelector("form")!;
      form.dispatchEvent(new Event("submit", { cancelable: true }));

      await vi.waitFor(() => {
        const err = getError(el, "key-error");
        expect(err?.textContent).toBe("Key is required");
      });
    });

    it("shows value-required error when value is empty", async () => {
      const el = createElement("create");
      const keyInput = getInput(el, "key") as HTMLInputElement;
      keyInput.value = "test_key";

      const form = el.shadowRoot!.querySelector("form")!;
      form.dispatchEvent(new Event("submit", { cancelable: true }));

      await vi.waitFor(() => {
        const err = getError(el, "value-error");
        expect(err?.textContent).toBe("Value is required");
      });
    });

    it("validates JSON when value starts with { or [", async () => {
      const el = createElement("create");
      const keyInput = getInput(el, "key") as HTMLInputElement;
      keyInput.value = "test_key";
      const valueInput = getInput(el, "value") as HTMLTextAreaElement;
      valueInput.value = "{invalid json}";

      const form = el.shadowRoot!.querySelector("form")!;
      form.dispatchEvent(new Event("submit", { cancelable: true }));

      await vi.waitFor(() => {
        const err = getError(el, "value-error");
        expect(err?.textContent).toBe("Invalid JSON");
      });
    });

    it("rejects keys with spaces", async () => {
      const el = createElement("create");
      const keyInput = getInput(el, "key") as HTMLInputElement;
      keyInput.value = "bad key";
      const valueInput = getInput(el, "value") as HTMLTextAreaElement;
      valueInput.value = "value";

      const form = el.shadowRoot!.querySelector("form")!;
      form.dispatchEvent(new Event("submit", { cancelable: true }));

      await vi.waitFor(() => {
        const err = getError(el, "key-error");
        expect(err?.textContent).toBe("Key must not contain spaces");
      });
    });
  });

  describe("edit mode", () => {
    it("renders with edit heading and read-only key field", () => {
      api.getConfig.mockResolvedValue({
        id: "1",
        key: "site_name",
        value: "val",
        createdAt: "",
        updatedAt: "",
      });

      const el = createElement("edit", "site_name");
      const heading = el.shadowRoot!.querySelector("h2");
      expect(heading?.textContent).toBe("Edit Config");

      const keyInput = getInput(el, "key") as HTMLInputElement;
      expect(keyInput.readOnly).toBe(true);
    });
  });

  describe("form submission", () => {
    it("calls store.createConfig on valid create submission", async () => {
      api.createConfig.mockResolvedValue({
        id: "1",
        key: "new_key",
        value: "hello",
        createdAt: "",
        updatedAt: "",
      });
      api.getAllConfigs.mockResolvedValue([]);

      const navigateHandler = vi.fn();
      document.addEventListener("navigate", navigateHandler);

      const el = createElement("create");
      const keyInput = getInput(el, "key") as HTMLInputElement;
      keyInput.value = "new_key";
      const valueInput = getInput(el, "value") as HTMLTextAreaElement;
      valueInput.value = "hello";

      const form = el.shadowRoot!.querySelector("form")!;
      form.dispatchEvent(new Event("submit", { cancelable: true }));

      await vi.waitFor(() => {
        expect(api.createConfig).toHaveBeenCalled();
      });

      document.removeEventListener("navigate", navigateHandler);
    });
  });
});
