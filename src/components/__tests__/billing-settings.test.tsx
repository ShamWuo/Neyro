import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BillingSettings } from "../billing-settings";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

// Mock fetch for API calls
global.fetch = jest.fn();

describe("BillingSettings", () => {
  const mockSubscription = {
    tier: SubscriptionTier.FREE,
    status: SubscriptionStatus.ACTIVE,
    isActive: false,
    isTrial: false,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    trialEndsAt: null,
    limits: {
      maxProjects: 3,
      maxAiCredits: 50,
      exports: false,
      templates: false,
      calendarSync: false,
      teamFeatures: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders current plan for free tier", () => {
    render(<BillingSettings subscription={mockSubscription} userId="user-123" />);

    expect(screen.getByText("Current Plan")).toBeInTheDocument();
    expect(screen.getByText("Free tier - Upgrade to unlock more features")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
  });

  it("renders upgrade options for free tier", () => {
    render(<BillingSettings subscription={mockSubscription} userId="user-123" />);

    expect(screen.getByText("Upgrade Your Plan")).toBeInTheDocument();
    expect(screen.getAllByText("Focus").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brain Trust").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$18").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$29").length).toBeGreaterThan(0);
  });

  it("shows FOCUS plan details correctly", () => {
    const focusSubscription = {
      ...mockSubscription,
      tier: SubscriptionTier.FOCUS,
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
      limits: {
        maxProjects: 7,
        maxAiCredits: -1,
        exports: true,
        templates: true,
        calendarSync: true,
        teamFeatures: false,
      },
    };

    render(<BillingSettings subscription={focusSubscription} userId="user-123" />);

    expect(screen.getByText("Focus - Full PARA enforcement")).toBeInTheDocument();
    expect(screen.getByText("$18")).toBeInTheDocument();
    expect(screen.getByText("Manage Subscription")).toBeInTheDocument();
  });

  it("shows trial information", () => {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const trialSubscription = {
      ...mockSubscription,
      tier: SubscriptionTier.FOCUS,
      status: SubscriptionStatus.TRIALING,
      isActive: true,
      isTrial: true,
      trialEndsAt,
    };

    render(<BillingSettings subscription={trialSubscription} userId="user-123" />);

    expect(screen.getByText(/Trial ends/)).toBeInTheDocument();
  });

  it("creates checkout session when upgrade button is clicked", async () => {
    const user = userEvent.setup();
    const mockUrl = "https://checkout.stripe.com/test";
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: mockUrl }),
    });

    // Mock window.location.href setter
    const locationHref = jest.fn();
    Object.defineProperty(window, "location", {
      value: {
        get href() {
          return "";
        },
        set href(value: string) {
          locationHref(value);
        },
        assign: jest.fn(),
        replace: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<BillingSettings subscription={mockSubscription} userId="user-123" />);

    const upgradeButton = screen.getByText("Upgrade to Focus");
    
    await act(async () => {
      await user.click(upgradeButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "FOCUS", billingCycle: "monthly" }),
      });
    }, { timeout: 3000 });
  });

  it("opens billing portal when manage subscription is clicked", async () => {
    const user = userEvent.setup();
    const activeSubscription = {
      ...mockSubscription,
      tier: SubscriptionTier.FOCUS,
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://billing.stripe.com/test" }),
    });

    // Mock window.location.assign (fallback used in component)
    const mockAssign = jest.fn();
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        assign: mockAssign,
        replace: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<BillingSettings subscription={activeSubscription} userId="user-123" />);

    const manageButton = screen.getByText("Manage Subscription");
    
    await act(async () => {
      await user.click(manageButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/stripe/manage-subscription", {
        method: "POST",
      });
    }, { timeout: 3000 });

    // In jsdom, window.location.href throws, but component catches it
    // The important part is fetch was called correctly
  });

  it("shows feature comparison table", () => {
    render(<BillingSettings subscription={mockSubscription} userId="user-123" />);

    expect(screen.getByText("Feature Comparison")).toBeInTheDocument();
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("AI Credits")).toBeInTheDocument();
    expect(screen.getByText("Exports")).toBeInTheDocument();
    expect(screen.getByText("Templates")).toBeInTheDocument();
  });

  it("handles loading state correctly", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({ url: "" }) }), 100))
    );

    render(<BillingSettings subscription={mockSubscription} userId="user-123" />);

    const upgradeButton = screen.getByText("Upgrade to Focus");
    
    await act(async () => {
      await user.click(upgradeButton);
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
