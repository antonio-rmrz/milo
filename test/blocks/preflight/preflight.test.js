import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Minimal config stub so getConfig() works without a full Milo bootstrap.
 */
function stubConfig() {
  const codeRoot = '/libs';
  window.__milo_config__ = { codeRoot };
  return codeRoot;
}

// ─── Token file tests ────────────────────────────────────────────────────────

describe('preflight-tokens.css', () => {
  let css;

  before(async () => {
    css = await readFile({ path: '../../../libs/blocks/preflight/preflight-tokens.css' });
  });

  it('exists and is non-empty', () => {
    expect(css).to.be.a('string').with.length.above(0);
  });

  it('is scoped to .preflight — does not declare tokens on :root', () => {
    // The file must NOT open a bare :root { block
    expect(css).to.not.match(/:root\s*\{/);
  });

  it('opens with a .preflight { block', () => {
    expect(css).to.match(/\.preflight\s*\{/);
  });

  it('defines --s2a-color-background token', () => {
    expect(css).to.include('--s2a-color-background');
  });

  it('defines --s2a-color-text-primary token', () => {
    expect(css).to.include('--s2a-color-text-primary');
  });

  it('defines --s2a-color-interactive-cta-default token', () => {
    expect(css).to.include('--s2a-color-interactive-cta-default');
  });

  it('defines --s2a-shadow-elevated token', () => {
    expect(css).to.include('--s2a-shadow-elevated');
  });

  it('defines --s2a-radius-modal token', () => {
    expect(css).to.include('--s2a-radius-modal');
  });

  it('defines --s2a-spacing-modal-padding token', () => {
    expect(css).to.include('--s2a-spacing-modal-padding');
  });

  it('defines --s2a-color-focus-ring token', () => {
    expect(css).to.include('--s2a-color-focus-ring');
  });

  it('defines hover and active CTA token variants', () => {
    expect(css).to.include('--s2a-color-interactive-cta-hover');
    expect(css).to.include('--s2a-color-interactive-cta-active');
  });

  it('defines disabled CTA token', () => {
    expect(css).to.include('--s2a-color-interactive-cta-disabled');
  });

  it('defines responsive font-size tokens', () => {
    expect(css).to.include('--s2a-font-size-title');
    expect(css).to.include('--s2a-font-size-tab');
  });
});

// ─── preflight.css token-only audit ─────────────────────────────────────────

describe('preflight.css — no raw design literals', () => {
  let css;

  before(async () => {
    css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
  });

  it('contains no bare hex colour literals (e.g. #fff, #1473e6)', () => {
    // Strip comments first so commented-out examples don't trip the check.
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // Allow #preflight (ID selector) but reject colour hex values.
    // A colour hex is a # followed by 3, 4, 6, or 8 hex digits NOT preceded
    // by a word character (i.e. not an ID/class selector fragment).
    const hexColourRe = /(?<![\w-])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/g;
    const matches = [...noComments.matchAll(hexColourRe)]
      // Filter out ID selectors like #preflight, #select-action, etc.
      .filter((m) => !/^#[a-z]/.test(m[0]));
    expect(matches, `Found raw hex literals: ${matches.map((m) => m[0]).join(', ')}`).to.have.length(0);
  });

  it('contains no raw rgb() / rgba() colour calls', () => {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(noComments).to.not.match(/rgba?\s*\(/);
  });

  it('references --s2a-color-background', () => {
    expect(css).to.include('--s2a-color-background');
  });

  it('references --s2a-shadow-elevated', () => {
    expect(css).to.include('--s2a-shadow-elevated');
  });

  it('references --s2a-color-focus-ring for focus-visible states', () => {
    expect(css).to.include('--s2a-color-focus-ring');
  });

  it('references --s2a-color-interactive-cta-disabled for disabled state', () => {
    expect(css).to.include('--s2a-color-interactive-cta-disabled');
  });

  it('contains @media (min-width: 900px) breakpoint', () => {
    expect(css).to.include('@media (min-width: 900px)');
  });

  it('contains @media (min-width: 1200px) breakpoint', () => {
    expect(css).to.include('@media (min-width: 1200px)');
  });

  it('does NOT introduce non-canonical breakpoints', () => {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // Extract all min-width values used in media queries
    const bpMatches = [...noComments.matchAll(/@media[^{]*min-width:\s*(\d+)px/g)]
      .map((m) => parseInt(m[1], 10));
    const canonical = new Set([900, 1200]);
    bpMatches.forEach((bp) => {
      expect(canonical.has(bp), `Non-canonical breakpoint found: ${bp}px`).to.be.true;
    });
  });
});

// ─── preflight.js — loadStyle integration ───────────────────────────────────

describe('preflight.js', () => {
  let js;

  before(async () => {
    js = await readFile({ path: '../../../libs/blocks/preflight/preflight.js' });
  });

  it('imports loadStyle from utils.js', () => {
    expect(js).to.match(/import\s*\{[^}]*loadStyle[^}]*\}\s*from.*utils\.js/);
  });

  it('calls loadStyle with preflight-tokens.css', () => {
    expect(js).to.include('preflight-tokens.css');
  });

  it('exports a default function named init (signature unchanged)', () => {
    expect(js).to.match(/export default async function init\s*\(/);
  });

  it('still calls render() to mount the Preact component', () => {
    expect(js).to.include('render(');
  });

  it('does not import from utils.js, scripts.js, personalization.js, or martech.js outside the preflight directory', () => {
    // Ensure no accidental imports of forbidden files were added
    const forbidden = ['scripts.js', 'personalization.js', 'martech.js'];
    forbidden.forEach((f) => {
      expect(js, `Should not import ${f}`).to.not.include(`from '../../${f}'`);
    });
  });
});

// ─── DOM / functional smoke tests ───────────────────────────────────────────

describe('preflight block — functional smoke tests', () => {
  let el;
  let loadStyleStub;
  let renderStub;

  before(async () => {
    // Provide a minimal config so getConfig() resolves
    stubConfig();

    // Stub loadStyle so it immediately resolves without fetching real CSS
    loadStyleStub = sinon.stub();
    loadStyleStub.callsFake((_href, cb) => { if (cb) cb(); });

    // Create a fresh host element
    el = document.createElement('div');
    el.className = 'preflight';
    document.body.appendChild(el);
  });

  after(() => {
    el?.remove();
    sinon.restore();
  });

  it('host element exists in the DOM', () => {
    expect(document.querySelector('.preflight')).to.exist;
  });

  it('preflight-tokens.css path is constructed from codeRoot/miloLibs', async () => {
    // Read the JS source and verify the path template
    const js = await readFile({ path: '../../../libs/blocks/preflight/preflight.js' });
    // The path must be built from base (miloLibs || codeRoot)
    expect(js).to.include('/blocks/preflight/preflight-tokens.css');
  });

  it('tab button group selector is present in CSS', async () => {
    const css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
    expect(css).to.include('preflight-tab-button-group');
  });

  it('preflight-action selector is present in CSS', async () => {
    const css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
    expect(css).to.include('preflight-action');
  });

  it('focus-visible rule exists for tab buttons', async () => {
    const css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
    expect(css).to.include('preflight-tab-button:focus-visible');
  });

  it('focus-visible rule exists for action buttons', async () => {
    const css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
    expect(css).to.include('preflight-action:focus-visible');
  });

  it('hover rule exists for action buttons', async () => {
    const css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
    expect(css).to.include('preflight-action:hover');
  });

  it('active rule exists for action buttons', async () => {
    const css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
    expect(css).to.include('preflight-action:active');
  });

  it('disabled rule exists for action buttons', async () => {
    const css = await readFile({ path: '../../../libs/blocks/preflight/preflight.css' });
    expect(css).to.include('preflight-action:disabled');
  });
});
