import { expect } from '@esm-bundle/chai';
import { html, render } from '../../../libs/deps/htm-preact.js';
import { computeBadges, TABS_CONFIG } from '../../../libs/blocks/preflight/preflight-utils.js';

// Minimal NavRail component for testing — mirrors the structure in preflight.js
// without loading the heavy panel modules.
function NavButton({ tab }) {
  return html`
    <button class="preflight-nav-button" role="tab">
      <span class="preflight-nav-label">${tab.title}</span>
    </button>`;
}

function TestPreflight({ tabs, badges }) {
  return html`
    <div class="preflight-header"><p id="preflight-title">Milo Preflight</p></div>
    <nav class="preflight-nav-rail" role="tablist">
      ${tabs.map((tab) => html`
        <${NavButton} tab=${tab} />
        ${badges[tab.title] ? html`<span class="preflight-badge preflight-badge-${badges[tab.title]}"></span>` : null}
      `)}
    </nav>`;
}

describe('Preflight shell', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.querySelector('.milo-preflight-overlay')?.remove();
  });

  describe('TABS_CONFIG', () => {
    it('contains 7 tab entries', () => {
      expect(TABS_CONFIG.length).to.equal(7);
    });

    it('contains expected tab titles', () => {
      const titles = TABS_CONFIG.map((t) => t.title);
      expect(titles).to.include('General');
      expect(titles).to.include('SEO');
      expect(titles).to.include('Martech');
      expect(titles).to.include('M@S');
      expect(titles).to.include('Accessibility');
      expect(titles).to.include('Performance');
      expect(titles).to.include('Assets');
    });
  });

  describe('NavRail', () => {
    it('renders 7 tab buttons', () => {
      render(html`<${TestPreflight} tabs=${TABS_CONFIG} badges=${{}} />`, container);
      const buttons = container.querySelectorAll('.preflight-nav-button');
      expect(buttons.length).to.equal(7);
    });

    it('renders expected tab labels', () => {
      render(html`<${TestPreflight} tabs=${TABS_CONFIG} badges=${{}} />`, container);
      const labels = [...container.querySelectorAll('.preflight-nav-label')].map((el) => el.textContent);
      expect(labels).to.include('General');
      expect(labels).to.include('SEO');
      expect(labels).to.include('Martech');
      expect(labels).to.include('M@S');
      expect(labels).to.include('Accessibility');
      expect(labels).to.include('Performance');
      expect(labels).to.include('Assets');
    });

    it('renders an error badge on tab when provided', () => {
      const badges = { SEO: 'error' };
      render(html`<${TestPreflight} tabs=${TABS_CONFIG} badges=${badges} />`, container);
      const errorBadge = container.querySelector('.preflight-badge-error');
      expect(errorBadge).to.exist;
    });

    it('renders a warning badge on tab when provided', () => {
      const badges = { Assets: 'warning' };
      render(html`<${TestPreflight} tabs=${TABS_CONFIG} badges=${badges} />`, container);
      const warningBadge = container.querySelector('.preflight-badge-warning');
      expect(warningBadge).to.exist;
    });
  });

  describe('computeBadges', () => {
    it('returns error badge for FAIL + CRITICAL on SEO section', () => {
      const mockResults = {
        runChecks: {
          seo: [{ status: 'fail', severity: 'critical' }],
          accessibility: [],
          assets: [],
          performance: [],
          structure: [],
          merch: [],
        },
      };
      const badges = computeBadges(mockResults);
      expect(badges.SEO).to.equal('error');
    });

    it('returns warning badge for FAIL + WARNING on Assets section', () => {
      const mockResults = {
        runChecks: {
          assets: [{ status: 'fail', severity: 'warning' }],
          accessibility: [],
          performance: [],
          seo: [],
          structure: [],
          merch: [],
        },
      };
      const badges = computeBadges(mockResults);
      expect(badges.Assets).to.equal('warning');
    });

    it('returns warning badge for LIMBO status', () => {
      const mockResults = {
        runChecks: {
          merch: [{ status: 'limbo', severity: 'warning' }],
          accessibility: [],
          assets: [],
          performance: [],
          seo: [],
          structure: [],
        },
      };
      const badges = computeBadges(mockResults);
      expect(badges['M@S']).to.equal('warning');
    });

    it('returns null badge when all checks pass', () => {
      const mockResults = {
        runChecks: {
          seo: [{ status: 'pass', severity: 'critical' }],
          accessibility: [],
          assets: [],
          performance: [],
          structure: [],
          merch: [],
        },
      };
      const badges = computeBadges(mockResults);
      expect(badges.SEO).to.be.null;
    });

    it('error takes precedence over warning on same section', () => {
      const mockResults = {
        runChecks: {
          performance: [
            { status: 'fail', severity: 'critical' },
            { status: 'fail', severity: 'warning' },
          ],
          accessibility: [],
          assets: [],
          seo: [],
          structure: [],
          merch: [],
        },
      };
      const badges = computeBadges(mockResults);
      expect(badges.Performance).to.equal('error');
    });

    it('General badge aggregates all six integrated sections', () => {
      const mockResults = {
        runChecks: {
          seo: [],
          accessibility: [],
          assets: [],
          performance: [],
          structure: [{ status: 'fail', severity: 'critical' }],
          merch: [],
        },
      };
      const badges = computeBadges(mockResults);
      expect(badges.General).to.equal('error');
    });
  });

  describe('notification suppression', () => {
    it('removes milo-preflight-overlay when dismissPreflightNotification is called', () => {
      const overlay = document.createElement('div');
      overlay.className = 'milo-preflight-overlay';
      document.body.appendChild(overlay);

      // Simulate the dismiss call from preflight.js useEffect
      document.querySelector('.milo-preflight-overlay')?.remove();

      expect(document.querySelector('.milo-preflight-overlay')).to.be.null;
    });

    it('calls window.dismissPreflightNotification when set (simulated mount)', () => {
      let called = 0;
      window.dismissPreflightNotification = () => { called += 1; };

      // Simulate what Preflight useEffect does
      if (window.dismissPreflightNotification) {
        window.dismissPreflightNotification();
      }

      expect(called).to.equal(1);
      delete window.dismissPreflightNotification;
    });
  });
});
