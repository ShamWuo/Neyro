import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingWizard } from "../onboarding-wizard";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("OnboardingWizard", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("renders first step", () => {
    render(<OnboardingWizard userId="user-123" />);

    expect(screen.getByText("Capture Your First Item")).toBeInTheDocument();
    expect(screen.getByText("Add something to your inbox to get started")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("shows progress bar", () => {
    render(<OnboardingWizard userId="user-123" />);

    const progressText = screen.getByText(/Step 1 of 4/);
    expect(progressText).toBeInTheDocument();
  });

  it("navigates to next step", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard userId="user-123" />);

    const nextButton = screen.getByText("Next");
    await act(async () => {
      await user.click(nextButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Create Your First Project")).toBeInTheDocument();
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    });
  });

  it("completes onboarding on last step", async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    render(<OnboardingWizard userId="user-123" onComplete={onComplete} />);

    // Navigate to last step
    let nextButton = screen.getByText("Next");
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await user.click(nextButton);
      });
      await waitFor(() => {
        const nextButtonExists = screen.queryByText("Next");
        const completeButtonExists = screen.queryByText("Complete");
        expect(nextButtonExists || completeButtonExists).toBeTruthy();
      }, { timeout: 2000 });
      nextButton = screen.queryByText("Next") as HTMLElement;
      if (!nextButton) break;
    }

    // Complete onboarding
    const completeButton = screen.getByText("Complete");
    await act(async () => {
      await user.click(completeButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/onboarding/complete", {
        method: "POST",
      });
    }, { timeout: 3000 });
    
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it("skips onboarding", async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    render(<OnboardingWizard userId="user-123" onComplete={onComplete} />);

    const skipButton = screen.getByText("Skip onboarding");
    await act(async () => {
      await user.click(skipButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/onboarding/complete", {
        method: "POST",
      });
      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("links to correct pages for each step", () => {
    render(<OnboardingWizard userId="user-123" />);

    // First step should link to inbox
    const inboxLink = screen.getByText("Go to Inbox");
    expect(inboxLink.closest("a")).toHaveAttribute("href", "/inbox");
  });
});
