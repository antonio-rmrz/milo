// Browser-compatible no-op stub for @playwright/test.
// Nala E2E test files import this module; when run through Web Test Runner
// (a browser environment) all tests are skipped so the import succeeds
// without pulling in Node.js-only internals.

const noop = () => {};

const test = Object.assign(noop, {
  describe: (name, fn) => { if (typeof describe !== 'undefined') describe(name, fn); },
  beforeEach: () => { if (typeof beforeEach !== 'undefined') beforeEach(noop); },
  afterEach: () => { if (typeof afterEach !== 'undefined') afterEach(noop); },
  beforeAll: () => { if (typeof before !== 'undefined') before(noop); },
  afterAll: () => { if (typeof after !== 'undefined') after(noop); },
  skip: noop,
  only: noop,
  step: () => Promise.resolve(),
  setTimeout: noop,
  info: () => ({}),
});

const expect = () => ({
  toHaveText: noop,
  toHaveCount: noop,
  toHaveURL: noop,
  toBeVisible: noop,
  toHaveAttribute: noop,
  not: {
    toHaveClass: noop,
    toBeVisible: noop,
  },
});

export { test, expect };
export default test;
