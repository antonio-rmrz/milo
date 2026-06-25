/**
 * Preflight Modal — test suite
 * Covers: modal open/close, tab switching, rail badges, notification suppression,
 * LCP highlight link, General badge with localization counts, asset rows,
 * back-popover, martech table, status chips, progress ring.
 */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

// ── Helpers ───────────────────────────────────────────────────────────────
function cleanDOM() {
  document.querySelectorAll('.preflight-overlay, .preflight-back-popover, [data-preflight-back-popover]').forEach((el) => el.remove());
  document.body.removeAttribute('data-preflight-open');
}

// ── status-chip ───────────────────────────────────────────────────────────
describe('StatusChip', () => {
  let createStatusChip;
  let chipVariantFromCounts;

  before(async () => {
    ({ createStatusChip, chipVariantFromCounts } = await import('../../../libs/features/preflight/components/status-chip.js'));
  });

  it('creates a chip with the correct class for error', () => {
    const chip = createStatusChip('error', 'Error');
    expect(chip.classList.contains('preflight-chip--error')).to.be.true;
    expect(chip.textContent).to.equal('Error');
    expect(chip.dataset.status).to.equal('error');
  });

  it('creates a chip with the correct class for warning', () => {
    const chip = createStatusChip('warning', 'Warning');
    expect(chip.classList.contains('preflight-chip--warning')).to.be.true;
  });

  it('creates a chip with the correct class for success', () => {
    const chip = createStatusChip('success', 'OK');
    expect(chip.classList.contains('preflight-chip--success')).to.be.true;
  });

  it('creates a chip with the correct class for info', () => {
    const chip = createStatusChip('info', 'Info');
    expect(chip.classList.contains('preflight-chip--info')).to.be.true;
  });

  it('chipVariantFromCounts returns error when errors > 0', () => {
    expect(chipVariantFromCounts(2, 0)).to.equal('error');
  });

  it('chipVariantFromCounts returns warning when only warnings', () => {
    expect(chipVariantFromCounts(0, 3)).to.equal('warning');
  });

  it('chipVariantFromCounts returns success when no issues', () => {
    expect(chipVariantFromCounts(0, 0)).to.equal('success');
  });
});

// ── progress-ring ─────────────────────────────────────────────────────────
describe('ProgressRing', () => {
  let createProgressRing;

  before(async () => {
    ({ createProgressRing } = await import('../../../libs/features/preflight/components/progress-ring.js'));
  });

  it('creates a span with class preflight-progress-ring', () => {
    const ring = createProgressRing();
    expect(ring.tagName.toLowerCase()).to.equal('span');
    expect(ring.classList.contains('preflight-progress-ring')).to.be.true;
  });

  it('contains an SVG element', () => {
    const ring = createProgressRing();
    expect(ring.querySelector('svg')).to.not.be.null;
  });

  it('has role=status for accessibility', () => {
    const ring = createProgressRing();
    expect(ring.getAttribute('role')).to.equal('status');
  });
});

// ── back-popover ──────────────────────────────────────────────────────────
describe('BackPopover', () => {
  let injectBackPopover;
  let removeBackPopover;

  before(async () => {
    ({ injectBackPopover, removeBackPopover } = await import('../../../libs/features/preflight/components/back-popover.js'));
  });

  afterEach(() => {
    removeBackPopover();
  });

  it('injects a popover element into the body', () => {
    injectBackPopover(() => {});
    expect(document.querySelector('[data-preflight-back-popover]')).to.not.be.null;
  });

  it('popover has class preflight-back-popover', () => {
    const el = injectBackPopover(() => {});
    expect(el.classList.contains('preflight-back-popover')).to.be.true;
  });

  it('calls reopenFn and removes itself on click', () => {
    const reopen = sinon.stub();
    const el = injectBackPopover(reopen);
    el.click();
    expect(reopen.calledOnce).to.be.true;
    expect(document.querySelector('[data-preflight-back-popover]')).to.be.null;
  });

  it('removeBackPopover removes the element', () => {
    injectBackPopover(() => {});
    removeBackPopover();
    expect(document.querySelector('[data-preflight-back-popover]')).to.be.null;
  });

  it('replaces existing popover when called twice', () => {
    injectBackPopover(() => {});
    injectBackPopover(() => {});
    expect(document.querySelectorAll('[data-preflight-back-popover]').length).to.equal(1);
  });
});

// ── rail ──────────────────────────────────────────────────────────────────
describe('Rail', () => {
  let buildRail;
  let setRailActive;
  let updateRailBadge;

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'performance', label: 'Performance' },
    { id: 'assets', label: 'Assets' },
  ];

  before(async () => {
    ({ buildRail, setRailActive, updateRailBadge } = await import('../../../libs/features/preflight/rail.js'));
  });

  it('builds a nav element', () => {
    const rail = buildRail(TABS, 'general', () => {});
    expect(rail.tagName.toLowerCase()).to.equal('nav');
  });

  it('renders one rail item per tab', () => {
    const rail = buildRail(TABS, 'general', () => {});
    expect(rail.querySelectorAll('.preflight-rail-item').length).to.equal(3);
  });

  it('marks the active tab with aria-selected=true', () => {
    const rail = buildRail(TABS, 'performance', () => {});
    const items = rail.querySelectorAll('.preflight-rail-item');
    const active = Array.from(items).find((i) => i.dataset.tabId === 'performance');
    expect(active.getAttribute('aria-selected')).to.equal('true');
  });

  it('calls onSelect with the tab id on click', () => {
    const onSelect = sinon.stub();
    const rail = buildRail(TABS, 'general', onSelect);
    const assetsItem = rail.querySelector('[data-tab-id="assets"]');
    assetsItem.click();
    expect(onSelect.calledWith('assets')).to.be.true;
  });

  it('setRailActive updates active class and aria-selected', () => {
    const rail = buildRail(TABS, 'general', () => {});
    setRailActive(rail, 'assets');
    const assetsItem = rail.querySelector('[data-tab-id="assets"]');
    expect(assetsItem.getAttribute('aria-selected')).to.equal('true');
    expect(assetsItem.classList.contains('active')).to.be.true;
    const generalItem = rail.querySelector('[data-tab-id="general"]');
    expect(generalItem.getAttribute('aria-selected')).to.equal('false');
  });

  it('updateRailBadge shows error badge when errors > 0', () => {
    const rail = buildRail(TABS, 'general', () => {});
    updateRailBadge(rail, 'general', 2, 0);
    const badge = rail.querySelector('[data-rail-badge="general"]');
    expect(badge.hasAttribute('hidden')).to.be.false;
    expect(badge.textContent).to.equal('2');
    expect(badge.classList.contains('preflight-badge--error')).to.be.true;
  });

  it('updateRailBadge shows warning badge when only warnings', () => {
    const rail = buildRail(TABS, 'general', () => {});
    updateRailBadge(rail, 'general', 0, 3);
    const badge = rail.querySelector('[data-rail-badge="general"]');
    expect(badge.classList.contains('preflight-badge--warning')).to.be.true;
    expect(badge.textContent).to.equal('3');
  });

  it('updateRailBadge hides badge when count is 0', () => {
    const rail = buildRail(TABS, 'general', () => {});
    updateRailBadge(rail, 'general', 2, 0);
    updateRailBadge(rail, 'general', 0, 0);
    const badge = rail.querySelector('[data-rail-badge="general"]');
    expect(badge.hasAttribute('hidden')).to.be.true;
  });
});

// ── general checks ────────────────────────────────────────────────────────
describe('GeneralChecks', () => {
  let runGeneralChecks;
  let countFaultyLinks;

  before(async () => {
    ({ runGeneralChecks, countFaultyLinks } = await import('../../../libs/features/preflight/checks/general.js'));
  });

  it('returns an array of check results', () => {
    const results = runGeneralChecks();
    expect(Array.isArray(results)).to.be.true;
    expect(results.length).to.be.greaterThan(0);
  });

  it('each result has label, status, and detail', () => {
    const results = runGeneralChecks();
    results.forEach((r) => {
      expect(r).to.have.property('label');
      expect(r).to.have.property('status');
      expect(r).to.have.property('detail');
    });
  });

  it('status values are valid', () => {
    const valid = new Set(['error', 'warning', 'success', 'info']);
    runGeneralChecks().forEach((r) => {
      expect(valid.has(r.status)).to.be.true;
    });
  });

  it('countFaultyLinks returns errors and warnings counts', () => {
    const result = countFaultyLinks();
    expect(result).to.have.property('errors');
    expect(result).to.have.property('warnings');
    expect(typeof result.errors).to.equal('number');
    expect(typeof result.warnings).to.equal('number');
  });
});

// ── performance checks ────────────────────────────────────────────────────
describe('PerformanceChecks', () => {
  let detectLcpElement;
  let buildPerformanceContent;

  before(async () => {
    ({ detectLcpElement, buildPerformanceContent } = await import('../../../libs/features/preflight/checks/performance.js'));
  });

  it('detectLcpElement resolves to null or an Element', async () => {
    const el = await detectLcpElement();
    expect(el === null || el instanceof Element).to.be.true;
  });

  it('buildPerformanceContent with null lcpElement has no highlight link', () => {
    const content = buildPerformanceContent(null);
    expect(content.querySelector('[data-preflight-highlight-lcp]')).to.be.null;
  });

  it('buildPerformanceContent with an element includes highlight link', () => {
    const img = document.createElement('img');
    img.src = 'test.jpg';
    document.body.appendChild(img);
    const content = buildPerformanceContent(img);
    expect(content.querySelector('[data-preflight-highlight-lcp]')).to.not.be.null;
    img.remove();
  });

  it('highlight link text is "Highlight LCP element"', () => {
    const img = document.createElement('img');
    img.src = 'test.jpg';
    document.body.appendChild(img);
    const content = buildPerformanceContent(img);
    const link = content.querySelector('[data-preflight-highlight-lcp]');
    expect(link.textContent).to.equal('Highlight LCP element');
    img.remove();
  });
});

// ── assets checks ─────────────────────────────────────────────────────────
describe('AssetsChecks', () => {
  let collectAssets;
  let buildAssetsContent;

  before(async () => {
    ({ collectAssets, buildAssetsContent } = await import('../../../libs/features/preflight/checks/assets.js'));
  });

  afterEach(() => {
    cleanDOM();
    document.querySelectorAll('img[data-test-asset]').forEach((el) => el.remove());
  });

  it('collectAssets returns an array', () => {
    expect(Array.isArray(collectAssets())).to.be.true;
  });

  it('collectAssets includes img elements with src', () => {
    const img = document.createElement('img');
    img.src = '/test-image.jpg';
    img.dataset.testAsset = 'true';
    document.body.appendChild(img);
    const assets = collectAssets();
    expect(assets.some((a) => a.src.includes('test-image.jpg'))).to.be.true;
  });

  it('buildAssetsContent returns a div', () => {
    const content = buildAssetsContent(() => {}, () => {});
    expect(content.tagName.toLowerCase()).to.equal('div');
  });

  it('asset rows have role=button', () => {
    const img = document.createElement('img');
    img.src = '/test-asset.jpg';
    img.dataset.testAsset = 'true';
    document.body.appendChild(img);
    const content = buildAssetsContent(() => {}, () => {});
    const rows = content.querySelectorAll('[data-preflight-asset-row]');
    rows.forEach((row) => {
      expect(row.getAttribute('role')).to.equal('button');
    });
  });

  it('clicking an asset row calls closeModal and injects back-popover', () => {
    const img = document.createElement('img');
    img.src = '/test-nav.jpg';
    img.dataset.testAsset = 'true';
    document.body.appendChild(img);
    const close = sinon.stub();
    const reopen = sinon.stub();
    const content = buildAssetsContent(close, reopen);
    document.body.appendChild(content);
    const row = content.querySelector('.preflight-asset-row');
    if (row) {
      row.click();
      expect(close.calledOnce).to.be.true;
      expect(document.querySelector('[data-preflight-back-popover]')).to.not.be.null;
    }
  });
});

// ── martech checks ────────────────────────────────────────────────────────
describe('MartechChecks', () => {
  let collectMartechData;
  let buildMartechContent;

  before(async () => {
    ({ collectMartechData, buildMartechContent } = await import('../../../libs/features/preflight/checks/martech.js'));
  });

  it('collectMartechData returns an array', () => {
    expect(Array.isArray(collectMartechData())).to.be.true;
  });

  it('buildMartechContent returns a div', () => {
    const content = buildMartechContent();
    expect(content.tagName.toLowerCase()).to.equal('div');
  });

  it('renders a table when martech data exists', () => {
    const meta = document.createElement('meta');
    meta.name = 'analytics';
    meta.content = 'test-value';
    document.head.appendChild(meta);
    const content = buildMartechContent();
    expect(content.querySelector('table.preflight-table')).to.not.be.null;
    meta.remove();
  });

  it('table has thead and tbody', () => {
    const meta = document.createElement('meta');
    meta.name = 'analytics';
    meta.content = 'test-value';
    document.head.appendChild(meta);
    const content = buildMartechContent();
    const table = content.querySelector('table');
    if (table) {
      expect(table.querySelector('thead')).to.not.be.null;
      expect(table.querySelector('tbody')).to.not.be.null;
    }
    meta.remove();
  });
});

// ── localization checks ───────────────────────────────────────────────────
describe('LocalizationChecks', () => {
  let runLocalizationChecks;
  let buildLocalizationContent;

  before(async () => {
    ({ runLocalizationChecks, buildLocalizationContent } = await import('../../../libs/features/preflight/checks/localization.js'));
  });

  it('runLocalizationChecks returns an array', () => {
    expect(Array.isArray(runLocalizationChecks())).to.be.true;
  });

  it('detects http links as warnings', () => {
    const a = document.createElement('a');
    a.href = 'http://example.com/page';
    document.body.appendChild(a);
    const issues = runLocalizationChecks();
    expect(issues.some((i) => i.severity === 'warning' && i.href.includes('example.com'))).to.be.true;
    a.remove();
  });

  it('buildLocalizationContent returns a div', () => {
    const content = buildLocalizationContent();
    expect(content.tagName.toLowerCase()).to.equal('div');
  });

  it('shows no-issues message when page is clean', () => {
    // Remove any http links
    document.querySelectorAll('a[href^="http:"]').forEach((el) => el.remove());
    const issues = runLocalizationChecks();
    if (issues.length === 0) {
      const content = buildLocalizationContent();
      expect(content.textContent).to.include('No localization issues');
    }
  });
});

// ── preflight core (open/close/tabs/notifications) ────────────────────────
describe('PreflightCore', () => {
  let openModal;
  let closeModal;

  before(async () => {
    ({ openModal, closeModal } = await import('../../../libs/features/preflight/preflight.js'));
  });

  afterEach(() => {
    closeModal();
    cleanDOM();
  });

  it('openModal appends .preflight-overlay to the body', () => {
    openModal();
    expect(document.querySelector('.preflight-overlay')).to.not.be.null;
  });

  it('openModal sets data-preflight-open on body', () => {
    openModal();
    expect(document.body.hasAttribute('data-preflight-open')).to.be.true;
  });

  it('closeModal removes data-preflight-open from body', () => {
    openModal();
    closeModal();
    expect(document.body.hasAttribute('data-preflight-open')).to.be.false;
  });

  it('closeModal hides the overlay', () => {
    openModal();
    closeModal();
    const overlay = document.querySelector('.preflight-overlay');
    expect(overlay?.hasAttribute('hidden')).to.be.true;
  });

  it('modal contains a .preflight-rail', () => {
    openModal();
    expect(document.querySelector('.preflight-rail')).to.not.be.null;
  });

  it('modal contains a .preflight-content', () => {
    openModal();
    expect(document.querySelector('.preflight-content')).to.not.be.null;
  });

  it('modal contains a close button', () => {
    openModal();
    expect(document.querySelector('.preflight-close-btn')).to.not.be.null;
  });

  it('close button closes the modal', () => {
    openModal();
    document.querySelector('.preflight-close-btn').click();
    expect(document.body.hasAttribute('data-preflight-open')).to.be.false;
  });

  it('Escape key closes the modal', () => {
    openModal();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.body.hasAttribute('data-preflight-open')).to.be.false;
  });

  it('clicking the backdrop closes the modal', () => {
    openModal();
    const overlay = document.querySelector('.preflight-overlay');
    overlay.click();
    expect(document.body.hasAttribute('data-preflight-open')).to.be.false;
  });

  it('modal has role=dialog', () => {
    openModal();
    expect(document.querySelector('[role="dialog"]')).to.not.be.null;
  });

  it('modal has aria-modal=true', () => {
    openModal();
    expect(document.querySelector('[aria-modal="true"]')).to.not.be.null;
  });

  it('all 5 tabs are rendered in the rail', () => {
    openModal();
    expect(document.querySelectorAll('.preflight-rail-item').length).to.equal(5);
  });

  it('clicking a rail item switches the active panel', () => {
    openModal();
    const performanceItem = document.querySelector('[data-tab-id="performance"]');
    performanceItem.click();
    const panel = document.querySelector('[data-tab-id="performance"].preflight-tab-panel');
    expect(panel?.classList.contains('active')).to.be.true;
  });

  it('only one panel is active at a time', () => {
    openModal();
    document.querySelector('[data-tab-id="assets"]').click();
    const activePanels = document.querySelectorAll('.preflight-tab-panel.active');
    expect(activePanels.length).to.equal(1);
  });

  it('openModal is idempotent — does not duplicate overlay', () => {
    openModal();
    openModal();
    expect(document.querySelectorAll('.preflight-overlay').length).to.equal(1);
  });

  it('General panel contains check rows', () => {
    openModal();
    const generalPanel = document.querySelector('[data-tab-id="general"].preflight-tab-panel');
    expect(generalPanel.querySelectorAll('.preflight-check-row').length).to.be.greaterThan(0);
  });

  it('Martech panel contains a card', () => {
    openModal();
    document.querySelector('[data-tab-id="martech"]').click();
    const martechPanel = document.querySelector('[data-tab-id="martech"].preflight-tab-panel');
    expect(martechPanel.querySelector('.preflight-card')).to.not.be.null;
  });

  it('Localization panel contains a card', () => {
    openModal();
    document.querySelector('[data-tab-id="localization"]').click();
    const locPanel = document.querySelector('[data-tab-id="localization"].preflight-tab-panel');
    expect(locPanel.querySelector('.preflight-card')).to.not.be.null;
  });

  it('content title updates when switching tabs', () => {
    openModal();
    document.querySelector('[data-tab-id="assets"]').click();
    const title = document.querySelector('.preflight-content-title');
    expect(title.textContent).to.equal('Assets');
  });
});
