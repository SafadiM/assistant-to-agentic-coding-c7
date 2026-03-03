import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ConfigDetail } from "../../src/components/ConfigDetail";

vi.mock("../../src/api/config-api", () => ({
  getAllConfigs: vi.fn().mockResolvedValue([]),
  getConfig: vi.fn(),
  createConfig: vi.fn(),
  updateConfig: vi.fn(),
  deleteConfig: vi.fn(),
}));

import * as configApi from "../../src/api/config-api";
const api = vi.mocked(configApi);

function renderDetail(configKey: string) {
  const onNavigate = vi.fn();
  render(<ConfigDetail configKey={configKey} onNavigate={onNavigate} />);
  return { onNavigate };
}

describe("ConfigDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error message when loadConfig fails", async () => {
    api.getConfig.mockRejectedValue(new Error("Not Found"));

    renderDetail("missing_key");

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /back to list/i })).toBeInTheDocument();
  });

  it("navigates to list when back button is clicked on error", async () => {
    api.getConfig.mockRejectedValue(new Error("Not Found"));

    const { onNavigate } = renderDetail("missing_key");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /back to list/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /back to list/i }));
    expect(onNavigate).toHaveBeenCalledWith({ name: "list" });
  });

  it("renders config details on success", async () => {
    api.getConfig.mockResolvedValue({
      id: "1",
      key: "site_name",
      value: "My App",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });

    renderDetail("site_name");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "site_name" })).toBeInTheDocument();
    });

    expect(screen.getByText("My App")).toBeInTheDocument();
  });
});
