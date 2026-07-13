/* eslint-disable import/no-extraneous-dependencies */
import { defaultReporter } from '@web/test-runner';
import { playwrightLauncher } from '@web/test-runner-playwright';

const GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';

// Nala files are Playwright E2E tests that cannot run in a browser WTR context.
// This plugin serves them as empty ESM modules so WTR can load them without
// errors (exit 0 with 0 tests) rather than crashing the test run (exit 1).
const nalaCompatPlugin = {
  name: 'nala-compat',
  serve(context) {
    const { url } = context.request;
    if (url.includes('/nala/') && (
      url.includes('.spec.js')
      || url.includes('.test.js')
    )) {
      return { body: 'export default {};', type: 'js' };
    }
    return undefined;
  },
};

export default {
  port: 2000,
  plugins: [nalaCompatPlugin],
  reporters: [
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
  ],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
  testsFinishTimeout: 60000,
  coverageConfig: {
    report: true,
    reportDir: 'coverage',
    threshold: { statements: 0, branches: 0, functions: 0, lines: 0 },
  },
  testRunnerHtml: (testFramework) => `
    <html>
      <head></head>
      <body>
        <script>window.isTestEnv = true;</script>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
  ...(GITHUB_ACTIONS ? { concurrentBrowsers: 1, concurrency: 1 } : {}),
};
