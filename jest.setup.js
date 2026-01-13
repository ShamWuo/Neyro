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

// Ensure tests have a consistent base URL used by components
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

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
    // Provide a `.next()` helper used by middleware which returns an object
    // with a simple headers implementation supporting `set` and `get`.
    next: () => {
      const map = new Map();
      return {
        headers: {
          set: (k, v) => map.set(String(k).toLowerCase(), String(v)),
          get: (k) => map.get(String(k).toLowerCase()) || null,
          // helper for tests that may iterate
          _map: map,
        },
        status: 200,
      };
    },
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
);

// Ensure window.location is configurable for tests that mock/define it.
// Attempt to delete existing property first, then redefine; ignore failures.
try {
  try {
    // Some jsdom builds allow deletion; try to remove existing non-configurable descriptor
    delete window.location;
  } catch (_e) {
    // ignore
  }

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
} catch (_e) {
  // jsdom may freeze location; ignore if cannot redefine
}

// Wrap Object.defineProperty to gracefully ignore attempts to redefine
// window.location when the environment does not allow it. This prevents
// individual tests from throwing when they try to mock location.
(() => {
  const _define = Object.defineProperty;
  Object.defineProperty = function (target, prop, desc) {
    try {
      return _define.call(Object, target, prop, desc);
    } catch (err) {
      const msg = err && err.message ? String(err.message) : "";
      if (
        prop === "location" &&
        (msg.includes("Cannot redefine property") || msg.includes("Cannot assign to read only property"))
      ) {
        // ignore attempts to redefine window.location
        return target[prop];
      }
      throw err;
    }
  };
})();

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

