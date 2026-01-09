// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js server components
jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    constructor(url, init) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Headers(init?.headers || {});
      this._body = init?.body;
    }
    async json() {
      return typeof this._body === "string" ? JSON.parse(this._body) : this._body;
    }
    async text() {
      return typeof this._body === "string" ? this._body : JSON.stringify(this._body);
    }
  },
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: (init?.status || 200) < 400,
    }),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve("")),
  },
});

// Mock navigator.share
Object.assign(navigator, {
  share: jest.fn(() => Promise.resolve()),
});

// Note: window.location is read-only in jsdom, so we can't mock it directly
// Components should use typeof window !== "undefined" ? window.location.href : "" pattern

// Suppress console errors from React act() warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('The current testing environment is not configured to support act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

