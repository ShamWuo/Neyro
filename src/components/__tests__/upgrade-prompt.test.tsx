import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpgradePrompt } from "../upgrade-prompt";

describe("UpgradePrompt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders projects limit message", () => {
    render(<UpgradePrompt reason="projects" current={3} limit={3} />);

    expect(screen.getByText("Unlock 7 Active Projects")).toBeInTheDocument();
    expect(screen.getByText(/You've reached the free tier limit of 3 active projects/)).toBeInTheDocument();
    expect(screen.getByText("Upgrade to Focus")).toBeInTheDocument();
  });

  it("renders AI credits message", () => {
    render(<UpgradePrompt reason="ai-credits" limit={50} />);

    expect(screen.getByText("Unlimited AI Credits")).toBeInTheDocument();
    expect(screen.getByText(/You've used all 50 AI credits this month/)).toBeInTheDocument();
  });

  it("renders exports message", () => {
    render(<UpgradePrompt reason="exports" />);

    expect(screen.getByText("Unlock Exports")).toBeInTheDocument();
    expect(screen.getByText(/Export your data as JSON, CSV, or PDF/)).toBeInTheDocument();
  });

  it("renders templates message", () => {
    render(<UpgradePrompt reason="templates" />);

    expect(screen.getByText("Unlock Templates")).toBeInTheDocument();
    expect(screen.getByText(/Access project templates and create your own/)).toBeInTheDocument();
  });

  it("dismisses when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();

    render(<UpgradePrompt reason="projects" onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText("Dismiss");
    
    await act(async () => {
      await user.click(dismissButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Unlock 7 Active Projects")).not.toBeInTheDocument();
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  it("links to pricing page", () => {
    render(<UpgradePrompt reason="projects" />);

    const upgradeLink = screen.getByText("Upgrade to Focus").closest("a");
    expect(upgradeLink).toHaveAttribute("href", "/pricing");
  });

  it("does not render when dismissed", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<UpgradePrompt reason="projects" />);

    const dismissButton = screen.getByLabelText("Dismiss");
    
    await act(async () => {
      await user.click(dismissButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Unlock 7 Active Projects")).not.toBeInTheDocument();
    });
  });
});
