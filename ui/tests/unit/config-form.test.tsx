import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfigForm } from "../../src/components/ConfigForm";
import { ToastProvider } from "../../src/hooks/useToast";

vi.mock("../../src/api/config-api", () => ({
  getAllConfigs: vi.fn().mockResolvedValue([]),
  getConfig: vi.fn(),
  createConfig: vi.fn(),
  updateConfig: vi.fn(),
  deleteConfig: vi.fn(),
}));

import * as configApi from "../../src/api/config-api";
const api = vi.mocked(configApi);

function renderForm(mode: "create" | "edit" = "create", configKey?: string) {
  const onNavigate = vi.fn();
  render(
    <ToastProvider>
      <ConfigForm mode={mode} configKey={configKey} onNavigate={onNavigate} />
    </ToastProvider>
  );
  return { onNavigate };
}

describe("ConfigForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create mode", () => {
    it("renders with create heading and editable key field", () => {
      renderForm("create");
      expect(screen.getByText("Create Config")).toBeInTheDocument();

      const keyInput = screen.getByRole("textbox", { name: /key/i });
      expect(keyInput).not.toHaveAttribute("readonly");
    });

    it("shows key-required error when key is empty", async () => {
      renderForm("create");
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Key is required")).toBeInTheDocument();
      });
    });

    it("shows value-required error when value is empty", async () => {
      renderForm("create");
      fireEvent.change(screen.getByRole("textbox", { name: /key/i }), {
        target: { value: "test_key" },
      });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Value is required")).toBeInTheDocument();
      });
    });

    it("validates JSON when value starts with { or [", async () => {
      renderForm("create");
      fireEvent.change(screen.getByRole("textbox", { name: /key/i }), {
        target: { value: "test_key" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /value/i }), {
        target: { value: "{invalid json}" },
      });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
      });
    });

    it("rejects keys with spaces", async () => {
      renderForm("create");
      fireEvent.change(screen.getByRole("textbox", { name: /key/i }), {
        target: { value: "bad key" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /value/i }), {
        target: { value: "value" },
      });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Key must not contain spaces")).toBeInTheDocument();
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

      renderForm("edit", "site_name");
      expect(screen.getByText("Edit Config")).toBeInTheDocument();

      const keyInput = screen.getByRole("textbox", { name: /key/i });
      expect(keyInput).toHaveAttribute("readonly");
    });
  });

  describe("form submission", () => {
    it("calls createConfig on valid create submission", async () => {
      api.createConfig.mockResolvedValue({
        id: "1",
        key: "new_key",
        value: "hello",
        createdAt: "",
        updatedAt: "",
      });
      api.getAllConfigs.mockResolvedValue([]);

      renderForm("create");
      fireEvent.change(screen.getByRole("textbox", { name: /key/i }), {
        target: { value: "new_key" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /value/i }), {
        target: { value: "hello" },
      });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(api.createConfig).toHaveBeenCalledWith({ key: "new_key", value: "hello" });
      });
    });
  });
});
