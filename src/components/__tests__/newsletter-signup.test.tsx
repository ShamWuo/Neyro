import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterSignup } from "../newsletter-signup";

// Mock fetch
global.fetch = jest.fn();

describe("NewsletterSignup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it("renders newsletter signup form", () => {
    render(<NewsletterSignup />);

    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("submits form with valid email", async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByText("Subscribe");

    await act(async () => {
      await user.type(input, "test@example.com");
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });
    });
  });

  it("shows success message after successful submission", async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByText("Subscribe");

    await act(async () => {
      await user.type(input, "test@example.com");
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Thanks! Check your email/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows error message on failed submission", async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByText("Subscribe");

    await act(async () => {
      await user.type(input, "test@example.com");
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Unable to subscribe/i)
      ).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("disables submit button while loading", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (fetch as jest.Mock).mockReturnValueOnce(promise);

    render(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByText("Subscribe");

    await act(async () => {
      await user.type(input, "test@example.com");
      await user.click(submitButton);
    });

    expect(submitButton).toBeDisabled();
    expect(screen.getByText("...")).toBeInTheDocument();

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true }),
      });
      await promise;
    });
  });

  it("requires email input", async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const submitButton = screen.getByText("Subscribe");
    await user.click(submitButton);

    // Form validation should prevent submission
    expect(fetch).not.toHaveBeenCalled();
  });
});

