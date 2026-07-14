import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { defaultReporter, summaryReporter } from '@web/test-runner';
import { playwrightLauncher } from '@web/test-runner-playwright';

const GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';

// Intercept @playwright/test requests in the browser and serve a no-op stub.
// Nala E2E test files import @playwright/test; WTR resolves the bare specifier
// via --node-resolve to a Node.js-only CJS bundle that crashes in the browser.
// This plugin short-circuits those requests before they reach the browser.
const STUB_URL = '/test/mocks/playwright-test.stub.js';

function playwrightTestStubPlugin() {
  const stubPath = fileURLToPath(new URL('./test/mocks/playwright-test.stub.js', import.meta.url));
  const stub = readFileSync(stubPath, 'utf-8');
  return {
    name: 'playwright-test-stub',
    serve(context) {
      if (
        context.path.includes('/node_modules/@playwright/test/')
        || context.path.includes('/node_modules/playwright/test')
        || context.path === '/@playwright/test'
      ) {
        return { body: stub, type: 'js' };
      }
      return undefined;
    },
    transform(context) {
      if (!context.response.is('js')) return undefined;
      let { body } = context;
      if (typeof body !== 'string') return undefined;

      let changed = false;

      // Rewrite ESM import from @playwright/test
      if (body.includes("from '@playwright/test'") || body.includes('from "@playwright/test"')) {
        body = body.replace(/from ['"]@playwright\/test['"]/g, `from '${STUB_URL}'`);
        changed = true;
      }

      // Rewrite CJS require('@playwright/test') — replace with no-op stubs.
      // We cannot inject top-level `import` mid-file, so we replace the require
      // call with an inline object that satisfies the destructured bindings.
      if (body.includes("require('@playwright/test')") || body.includes('require("@playwright/test")')) {
        const noopFn = 'function(){}';
        const stubObj = `{ test: Object.assign(${noopFn},{ describe:${noopFn},beforeEach:${noopFn},afterEach:${noopFn},skip:${noopFn},only:${noopFn},step:()=>Promise.resolve(),setTimeout:${noopFn},info:()=>({}) }), expect: ()=>({ toHaveText:${noopFn},toHaveCount:${noopFn},toHaveURL:${noopFn},toBeVisible:${noopFn},toHaveAttribute:${noopFn},not:{toHaveClass:${noopFn},toBeVisible:${noopFn}} }) }`;
        body = body.replace(/require\(['"]@playwright\/test['"]\)/g, stubObj);
        changed = true;
      }

      // Rewrite CJS module.exports = { a, b, c } for nala helper files served to the browser.
      // Named imports (import { constructTestUrl } from ...) require individual ESM exports.
      if (body.includes('module.exports') && !body.includes('export ')) {
        body = body.replace(
          /module\.exports\s*=\s*\{([^}]+)\}\s*;?/s,
          (_, names) => {
            const exports = names.split(',').map((s) => s.trim()).filter(Boolean);
            return `export { ${exports.join(', ')} };`;
          },
        );
        changed = true;
      }

      // Shim process.env for files that read env vars at module scope
      if (body.includes('process.env.') && !body.includes('typeof process')) {
        body = `const process = globalThis.process || { env: {} };\n${body}`;
        changed = true;
      }

      return changed ? { body } : undefined;
    },
  };
}

function customReporter() {
  return {
    async reportTestFileResults({ logger, sessionsForTestFile }) {
      sessionsForTestFile.forEach((session) => {
        session.testResults?.tests?.forEach((test) => {
          if (!test.passed && !test.skipped) {
            logger.log(test);
          }
        });
      });
    },
  };
}
export default {
  playwright: true,
  browsers: [
    playwrightLauncher({ product: 'chromium', launchOptions: { headless: true } }),
  ],
  coverageConfig: {
    include: [
      '**/libs/**',
      '**/tools/**',
      '**/build/**',
    ],
    exclude: [
      '**/mocks/**',
      '**/node_modules/**',
      '**/test/**',
      '**/deps/**',
      '**/imslib/imslib.min.js',
      '**/features/spectrum-web-components/**',
      // TODO: folders below need to have tests written for 100% coverage
      '**/ui/controls/**',
      '**/blocks/library-config/**',
      '**/hooks/**',
      '**/special/tacocat/**',
      '**/libs/martech/martech.js', // ticket to add unit test: https://jira.corp.adobe.com/browse/MWPW-145975
      '**/blocks/bulk-publish/**', // this block is not in use
    ],
  },
  testFramework: { config: { retries: GITHUB_ACTIONS ? 1 : 0 } },
  testsFinishTimeout: 130000,
  plugins: [playwrightTestStubPlugin()],
  reporters: [
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
    customReporter(),
  ],
  testRunnerHtml: (testFramework) => `
    <html>
      <head>
        <script type="importmap">
          {
            "imports": {
              "https://www.adobe.com/mas/libs/": "/node_modules/@adobecom/mas-platform/web-components/dist/"
            }
          }
        </script>
        <link rel="icon" href="/libs/img/favicons/favicon.ico" size="any">
        <script type='module'>
          const oldFetch = window.fetch;
          window.fetch = async (resource, options) => {
            if (!resource.startsWith('/') && !resource.startsWith('http://localhost')) {
              console.error(
                '** fetch request for an external resource is disallowed in unit tests, please find a way to mock! https://github.com/orgs/adobecom/discussions/814#discussioncomment-6060759 provides guidance on how to fix the issue.',
                resource
              );
            }
            return oldFetch.call(window, resource, options);
          };

          const oldXHROpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function (...args) {
            let [method, url, asyn] = args;
            if (!url.startsWith('/') && !url.startsWith('http://localhost')) {
              console.error(
                '** XMLHttpRequest request for an external resource is disallowed in unit tests, please find a way to mock! https://github.com/orgs/adobecom/discussions/814#discussioncomment-6060759 provides guidance on how to fix the issue.',
                url
              );
            }
            return oldXHROpen.apply(this, args);
          };

          const observer = new MutationObserver((mutationsList, observer) => {
            for(let mutation of mutationsList) {
              if (mutation.type === 'childList') {
                for(let node of mutation.addedNodes) {
                  if(node.nodeName === 'SCRIPT' && node.src && !node.src.startsWith('http://localhost')) {
                    console.error(
                      '** An external 3rd script has been added. This is disallowed in unit tests, please find a way to mock! https://github.com/orgs/adobecom/discussions/814#discussioncomment-6060891 provides guidance on how to fix the issue.',
                      node.src
                    );
                  }
                }
              }
            }
          });
          observer.observe(document.head, { childList: true });
        </script>
      </head>
      <body>
        <script type='module' src='${testFramework}'></script>
      </body>
    </html>`,
  // npm run test:file:watch
  // allows to you to run single test file & view the result in a browser.
  // files: ['**/utils.test.js'],
};
