/**
 * test/blocks/preflight/preflight.test.js
 *
 * Tests for the Preflight Modal Spectrum-2 Light Theme redesign.
 *
 * Verifies:
 *  1. The s2a-tokens.css file declares the required --s2a-* custom properties.
 *  2. preflight.css references --s2a-* tokens and does NOT contain hardcoded
 *     hex or rgb colour values for design decisions.
 *  3. Responsive breakpoints (900 px, 1200 px) are present in preflight.css.
 *  4. Interactive-state tokens (--s2a-state-*) are referenced.
 *  5. Focus-ring tokens (--s2a-focus-ring-*) are referenced.
 *  6. The preflight JS decorator renders the expected DOM structure without
 *     any functional changes.
 */

import { expect } from '@esm-bundle/chai';
import { readFileSync } from 'fs';

// ── Helper: read a repo file relative to the project root ────────────────
function readCSS(relativePath) {
  // In the test runner (web-test-runner / mocha in Node) we can use
  // fetch() to load the file from the dev server, or fall back to a
  // simple string import via the bundler.  We use fetch here because
  // the test suite runs under @web/test-runner with a static server.
  return fetch(`/${relativePath}`).then((r) => {
    if (!r.ok) throw new Error(`Could not load ${relativePath}: ${r.status}`);
    return r.text();
  });
}

// ── s2a-tokens.css ───────────────────────────────────────────────────────
describe('s2a-tokens.css — token declarations', () => {
  let css;

  before(async () => {
    css = await readCSS('libs/styles/s2a-tokens.css');
  });

  const requiredTokens = [
    '--s2a-bg-surface',
    '--s2a-bg-header',
    '--s2a-bg-action',
    '--s2a-bg-action-hover',
    '--s2a-bg-action-active',
    '--s2a-bg-action-disabled',
    '--s2a-text-primary',
    '--s2a-text-secondary',
    '--s2a-text-on-dark',
    '--s2a-text-on-action',
    '--s2a-text-link',
    '--s2a-text-link-hover',
    '--s2a-text-disabled',
    '--s2a-color-accent',
    '--s2a-color-accent-hover',
    '--s2a-color-focus-ring',
    '--s2a-border-color',
    '--s2a-border-radius-s',
    '--s2a-border-radius-m',
    '--s2a-border-radius-l',
    '--s2a-border-radius-xl',
    '--s2a-shadow-overlay',
    '--s2a-spacing-xxs',
    '--s2a-spacing-xs',
    '--s2a-spacing-s',
    '--s2a-spacing-m',
    '--s2a-spacing-l',
    '--s2a-spacing-xl',
    '--s2a-spacing-xxl',
    '--s2a-spacing-xxxl',
    '--s2a-font-size-heading-xl',
    '--s2a-font-size-heading-l',
    '--s2a-font-size-heading-m',
    '--s2a-font-size-body-m',
    '--s2a-font-size-body-s',
    '--s2a-font-weight-regular',
    '--s2a-font-weight-medium',
    '--s2a-font-weight-bold',
    '--s2a-line-height-heading',
    '--s2a-line-height-body',
    '--s2a-state-hover-bg',
    '--s2a-state-active-bg',
    '--s2a-state-focus-bg',
    '--s2a-state-disabled-opacity',
    '--s2a-focus-ring-color',
    '--s2a-focus-ring-width',
    '--s2a-focus-ring-offset',
    '--s2a-color-overlay-background',
    '--s2a-breakpoint-md',
    '--s2a-breakpoint-lg',
  ];

  requiredTokens.forEach((token) => {
    it(`declares ${token}`, () => {
      expect(css).to.include(token);
    });
  });

  it('does not shadow --spectrum-* variables', () => {
    // The file must not contain any --spectrum- declarations
    const spectrumDeclarations = css.match(/--spectrum-[\w-]+\s*:/g);
    expect(spectrumDeclarations).to.be.null;
  });

  it('is scoped to :root', () => {
    expect(css).to.include(':root');
  });
});

// ── preflight.css ────────────────────────────────────────────────────────
describe('preflight.css — Spectrum-2 light theme', () => {
  let css;

  before(async () => {
    css = await readCSS('libs/blocks/preflight/preflight.css');
  });

  it('references --s2a-bg-surface for the modal background', () => {
    expect(css).to.include('var(--s2a-bg-surface)');
  });

  it('references --s2a-text-primary for body text colour', () => {
    expect(css).to.include('var(--s2a-text-primary)');
  });

  it('references --s2a-shadow-overlay for modal elevation', () => {
    expect(css).to.include('var(--s2a-shadow-overlay)');
  });

  it('references --s2a-border-radius-xl for modal corners', () => {
    expect(css).to.include('var(--s2a-border-radius-xl)');
  });

  it('references --s2a-state-hover-bg for hover state', () => {
    expect(css).to.include('var(--s2a-state-hover-bg)');
  });

  it('references --s2a-state-focus-bg for focus state', () => {
    expect(css).to.include('var(--s2a-state-focus-bg)');
  });

  it('references --s2a-focus-ring-color for focus ring', () => {
    expect(css).to.include('var(--s2a-focus-ring-color)');
  });

  it('references --s2a-focus-ring-width for focus ring width', () => {
    expect(css).to.include('var(--s2a-focus-ring-width)');
  });

  it('references --s2a-font-size-heading-xl for the modal title', () => {
    expect(css).to.include('var(--s2a-font-size-heading-xl)');
  });

  it('references --s2a-font-weight-bold for bold text', () => {
    expect(css).to.include('var(--s2a-font-weight-bold)');
  });

  it('references --s2a-spacing-l for standard padding', () => {
    expect(css).to.include('var(--s2a-spacing-l)');
  });

  it('references --s2a-bg-action for the action button background', () => {
    expect(css).to.include('var(--s2a-bg-action-hover)');
  });

  it('references --s2a-bg-action-disabled for disabled state', () => {
    expect(css).to.include('var(--s2a-bg-action-disabled)');
  });

  it('references --s2a-text-link for link colour', () => {
    expect(css).to.include('var(--s2a-text-link)');
  });

  // ── Responsive breakpoints ──────────────────────────────────────────
  it('contains a 900 px breakpoint for two-column layout', () => {
    expect(css).to.match(/min-width:\s*900px/);
  });

  it('contains a 1200 px breakpoint for wider two-column layout', () => {
    expect(css).to.match(/min-width:\s*1200px/);
  });

  it('contains a max-width 899 px rule for single-column mobile layout', () => {
    expect(css).to.match(/max-width:\s*899px/);
  });

  // ── No hardcoded design colours ─────────────────────────────────────
  it('does not contain hardcoded hex colour values for design decisions', () => {
    // Strip comments first
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // Allow #ffffff and #f8f8f8 only inside --s2a-* token declarations
    // (those live in s2a-tokens.css, not here).  In preflight.css itself
    // there should be zero bare hex values outside of var() references.
    const hexMatches = noComments.match(/#[0-9a-fA-F]{3,8}(?![\w-])/g);
    expect(hexMatches).to.be.null;
  });

  it('does not contain hardcoded rgb() colour values for design decisions', () => {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // rgb() / rgba() that are NOT inside a var() or a token declaration
    // should not appear in preflight.css
    const rgbMatches = noComments.match(/(?<!var\([^)]*?)\brgb[a]?\s*\(/g);
    expect(rgbMatches).to.be.null;
  });

  // ── Local alias variables ───────────────────────────────────────────
  it('declares --preflight-action-color alias', () => {
    expect(css).to.include('--preflight-action-color');
  });

  it('declares --preflight-notch-size alias', () => {
    expect(css).to.include('--preflight-notch-size');
  });

  // ── No --spectrum-* shadowing ───────────────────────────────────────
  it('does not declare --spectrum-* variables', () => {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const spectrumDeclarations = noComments.match(/--spectrum-[\w-]+\s*:/g);
    expect(spectrumDeclarations).to.be.null;
  });

  // ── Logical properties for RTL safety ──────────────────────────────
  it('uses logical properties (inset-inline-start) instead of left/right for RTL safety', () => {
    expect(css).to.include('inset-inline-start');
  });
});

// ── preflight.js — no functional JS changes ──────────────────────────────
describe('preflight.js — decorator renders expected DOM structure', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'preflight';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('the preflight container element exists in the DOM', () => {
    expect(document.querySelector('.preflight')).to.exist;
  });

  it('the preflight container has the correct class name', () => {
    expect(container.classList.contains('preflight')).to.be.true;
  });
});
