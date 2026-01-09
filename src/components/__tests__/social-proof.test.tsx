import { render, screen } from "@testing-library/react";
import { SocialProof } from "../social-proof";

describe("SocialProof", () => {
  it("renders social proof stats", () => {
    render(<SocialProof />);

    expect(screen.getByText("Active users")).toBeInTheDocument();
    expect(screen.getByText("Projects completed")).toBeInTheDocument();
    expect(screen.getByText("Weekly reviews")).toBeInTheDocument();
  });

  it("displays stat values", () => {
    render(<SocialProof />);

    expect(screen.getByText("500+")).toBeInTheDocument();
    expect(screen.getByText("2,500+")).toBeInTheDocument();
    expect(screen.getByText("10,000+")).toBeInTheDocument();
  });

  it("displays stat descriptions", () => {
    render(<SocialProof />);

    expect(screen.getByText("Building better habits")).toBeInTheDocument();
    expect(screen.getByText("With PARA discipline")).toBeInTheDocument();
    expect(screen.getByText("Shipped on time")).toBeInTheDocument();
  });
});

