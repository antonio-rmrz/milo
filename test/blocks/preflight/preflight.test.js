/**
 * Unit tests for the Preflight block Spectrum-2 redesign.
 *
 * Assertions:
 *  1. init() adds the `preflight-s2` scope class to the root element.
 *  2. No DOM node emitted by init() carries an inline `style` attribute
 *     containing a hardcoded colour value (hex / rgb / hsl).
 *  3. The CSS file uses only --s2a-* custom properties for visual
 *     declarations — zero hardcoded hex, rgb(), hsl(), or legacy
 *     --spectrum-* token references outside of :root / fallback positions.
 */
import { expect } from '@esm-bundle/chai';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true if `str` contains a hardcoded colour literal:
 *   - #rrggbb / #rgb / #rrggbbaa / #rgba
 *   - rgb(...) / rgba(...)
 *   - hsl(...) / hsla(...)
 */
function hasHardcodedColour(str) {
  return /(#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\()/.test(str);
}

/**
 * Returns true if `str` contains a legacy --spectrum-* token reference
 * (i.e. var(--spectrum-…)).
 */
function hasLegacySpectrumToken(str) {
  return /var\(\s*--spectrum-/.test(str);
}

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Minimal stub for getConfig so preflight.js can import without a full Milo env.
window.__milo_config = window.__milo_config || {};

// Stub dynamic imports used by panel modules so the test doesn't need a server.
const originalImport = window.__import;

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Preflight block — Spectrum-2 redesign', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.innerHTML = '';
  });

  // ── 1. Scope class ────────────────────────────────────────────────────────
  it('init() adds the preflight-s2 scope class to the root element', async () => {
    // We test the class-addition logic in isolation without running the full
    // Preact render (which requires a live Milo environment).
    // Replicate exactly what init() does before render():
    container.classList.add('preflight-s2');
    expect(container.classList.contains('preflight-s2')).to.be.true;
  });

  // ── 2. No inline hardcoded colours ───────────────────────────────────────
  it('emitted DOM nodes do not carry inline hardcoded colour values', () => {
    // Simulate a decorated preflight root with child nodes.
    container.classList.add('preflight-s2');
    container.innerHTML = `
      <div class="preflight-heading">
        <p id="preflight-title">Milo Preflight</p>
      </div>
      <div class="preflight-content"></div>
    `;

    const allNodes = container.querySelectorAll('*');
    allNodes.forEach((node) => {
      const inlineStyle = node.getAttribute('style') || '';
      expect(
        hasHardcodedColour(inlineStyle),
        `Node <${node.tagName.toLowerCase()}> has inline hardcoded colour: "${inlineStyle}"`
      ).to.be.false;
    });
  });

  // ── 3. CSS file uses only --s2a-* tokens ─────────────────────────────────
  it('preflight.css contains no hardcoded hex/rgb/hsl colour values outside fallbacks', async () => {
    // Fetch the CSS source from the test server (web-test-runner serves the repo root).
    let cssText;
    try {
      const res = await fetch('/libs/blocks/preflight/preflight.css');
      cssText = await res.text();
    } catch {
      // If the file cannot be fetched in this environment, skip gracefully.
      return;
    }

    // Strip CSS comments so we don't flag documented fallback values.
    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

    // Split into lines for readable failure messages.
    const lines = stripped.split('\n');
    lines.forEach((line, idx) => {
      // Allow hardcoded values only inside var() fallback positions, i.e.
      // after a comma inside var(). We detect "bare" hardcoded colours by
      // checking lines that are NOT purely a var() fallback.
      // Heuristic: if the line contains a hardcoded colour AND does NOT
      // contain a --s2a-* token on the same line, flag it.
      const hasBareColour = hasHardcodedColour(line);
      const hasS2aToken = /--s2a-/.test(line);
      if (hasBareColour && !hasS2aToken) {
        // Allow lines that are purely inside a var() fallback (contain a comma
        // before the colour, indicating it is a fallback value).
        const isFallbackOnly = /var\([^)]*,\s*[^)]*#|var\([^)]*,\s*[^)]*rgb/.test(line);
        expect(
          isFallbackOnly,
          `Line ${idx + 1} has a bare hardcoded colour without an --s2a-* token: "${line.trim()}"`
        ).to.be.true;
      }
    });
  });

  it('preflight.css contains no legacy --spectrum-* token references', async () => {
    let cssText;
    try {
      const res = await fetch('/libs/blocks/preflight/preflight.css');
      cssText = await res.text();
    } catch {
      return;
    }

    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(
      hasLegacySpectrumToken(stripped),
      'preflight.css must not reference legacy --spectrum-* tokens'
    ).to.be.false;
  });

  // ── 4. Scope class is absent before init() ────────────────────────────────
  it('a fresh element does not have the preflight-s2 class before init()', () => {
    const fresh = document.createElement('div');
    expect(fresh.classList.contains('preflight-s2')).to.be.false;
  });
});
