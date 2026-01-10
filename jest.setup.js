// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Stripe package BEFORE any imports that use it
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

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

// Mock global fetch for Stripe and other API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => "",
  })
) as jest.Mock;

// Mock window.location - use Object.defineProperty instead of assignment
Object.defineProperty(window, "location", {
  value: {
    href: "",
    origin: "http://localhost:3001",
    protocol: "http:",
    host: "localhost:3001",
    hostname: "localhost",
    port: "3001",
    pathname: "/",
    search: "",
    hash: "",
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
  configurable: true,
});

// Suppress console errors from React act() warnings and jsdom navigation errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (
      message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('The current testing environment is not configured to support act') ||
      message.includes('Not implemented: navigation') ||
      message.includes('Error: Not implemented') ||
      message.includes('fetch() function not provided')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

