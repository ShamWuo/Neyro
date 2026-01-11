import React from "react";
import { render, screen } from "@testing-library/react";
import ActiveProjectsBadge from "../active-projects-badge";

jest.mock("@/lib/useProjectQuota", () => ({
  useProjectQuota: jest.fn(() => ({
    data: { active: 6, limit: 7, remaining: 1 },
    loading: false,
  })),
}));

describe("ActiveProjectsBadge with warnings", () => {
  it("shows warning when near limit (6/7)", () => {
    render(<ActiveProjectsBadge />);
    expect(screen.getByText("6/7")).toBeInTheDocument();
    expect(screen.getByLabelText("warning")).toBeInTheDocument();
  });
});
