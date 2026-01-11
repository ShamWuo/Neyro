import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import ProjectQuota from "@/components/project-quota";

describe("ProjectQuota component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders quota info from API", async () => {
    // Mock fetch to return expected JSON
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ active: 3, limit: 7, remaining: 4, allowed: true }),
    });

    await act(async () => {
      render(<ProjectQuota />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Active projects:/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/7/)).toBeInTheDocument();
    });
  });
});
