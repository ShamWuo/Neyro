// Suppress console logs during tests to avoid noise
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for actual test failures
};
