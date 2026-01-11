import { render } from "@testing-library/react";
import { Analytics } from "../analytics";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/test-path"),
}));

describe("Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock gtag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag = jest.fn();
    process.env.NEXT_PUBLIC_GA_ID = "G-TEST123";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GA_ID;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).gtag;
  });

  it("renders without crashing", () => {
    render(<Analytics />);
    // Component returns null, so we just check it doesn't throw
  });

  it("tracks page views on mount", () => {
    render(<Analytics />);

    expect(window.gtag).toHaveBeenCalledWith("config", "G-TEST123", {
      page_path: "/test-path",
    });
  });

  it("tracks share events", () => {
    render(<Analytics />);

    const event = new CustomEvent("share", { detail: { platform: "twitter" } });
    window.dispatchEvent(event);

    expect(window.gtag).toHaveBeenCalledWith("event", "share", {
      method: "twitter",
      content_type: "page",
      item_id: "/test-path",
    });
  });

  it("does not track if gtag is not available", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).gtag;
    render(<Analytics />);
    // Should not throw
  });
});

