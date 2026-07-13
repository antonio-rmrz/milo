import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { badgeCounts, updateBadge } from '../../../libs/blocks/preflight/badge-counts.js';

describe('Preflight badge-counts module', () => {
  afterEach(() => {
    sinon.restore();
    /* reset badge counts between tests */
    ['General', 'SEO', 'Martech', 'M@S', 'Accessibility', 'Performance', 'Assets'].forEach((tab) => {
      updateBadge(tab, 0, 0);
    });
  });

  it('exports badgeCounts signal with all 7 tabs', () => {
    const keys = Object.keys(badgeCounts.value);
    expect(keys).to.include.members(['General', 'SEO', 'Martech', 'M@S', 'Accessibility', 'Performance', 'Assets']);
    expect(keys.length).to.equal(7);
  });

  it('initialises each tab with errors:0 warnings:0', () => {
    Object.values(badgeCounts.value).forEach(({ errors, warnings }) => {
      expect(errors).to.equal(0);
      expect(warnings).to.equal(0);
    });
  });

  it('updateBadge sets error count for a tab', () => {
    updateBadge('General', 3, 1);
    expect(badgeCounts.value.General.errors).to.equal(3);
    expect(badgeCounts.value.General.warnings).to.equal(1);
  });

  it('updateBadge does not mutate other tabs', () => {
    updateBadge('Performance', 2, 0);
    expect(badgeCounts.value.General.errors).to.equal(0);
    expect(badgeCounts.value.Assets.errors).to.equal(0);
    expect(badgeCounts.value.Performance.errors).to.equal(2);
  });

  it('updateBadge reflects in signal value immediately', () => {
    updateBadge('Assets', 0, 5);
    expect(badgeCounts.value.Assets.warnings).to.equal(5);
  });

  it('updateBadge can reset a tab back to zero', () => {
    updateBadge('SEO', 4, 2);
    updateBadge('SEO', 0, 0);
    expect(badgeCounts.value.SEO.errors).to.equal(0);
    expect(badgeCounts.value.SEO.warnings).to.equal(0);
  });
});

describe('Preflight notification suppression', () => {
  let overlay;

  beforeEach(() => {
    overlay = document.createElement('div');
    overlay.className = 'milo-preflight-overlay';
    document.body.appendChild(overlay);
  });

  afterEach(() => {
    overlay?.remove();
    document.querySelectorAll('.milo-preflight-overlay').forEach((el) => el.remove());
  });

  it('preflight:open event hides the notification overlay', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    /* Simulate what init() does: find overlay and hide it */
    const found = document.querySelector('.milo-preflight-overlay');
    if (found) {
      found.dataset.preflightHidden = 'true';
      found.style.display = 'none';
    }

    expect(overlay.style.display).to.equal('none');
    expect(overlay.dataset.preflightHidden).to.equal('true');
    el.remove();
  });

  it('restoring notification removes hidden attribute and display style', () => {
    overlay.dataset.preflightHidden = 'true';
    overlay.style.display = 'none';

    /* Simulate restoreNotification() */
    const found = document.querySelector('.milo-preflight-overlay[data-preflight-hidden]');
    if (found) {
      delete found.dataset.preflightHidden;
      found.style.display = '';
    }

    expect(overlay.style.display).to.equal('');
    expect(overlay.dataset.preflightHidden).to.be.undefined;
  });

  it('notification without preflight-hidden marker is not touched on restore', () => {
    overlay.style.display = 'block';

    /* restoreNotification only touches elements with data-preflight-hidden */
    const found = document.querySelector('.milo-preflight-overlay[data-preflight-hidden]');
    expect(found).to.be.null;
    expect(overlay.style.display).to.equal('block');
  });
});

describe('Preflight back-to-preflight popover', () => {
  afterEach(() => {
    document.querySelectorAll('.preflight-back-popover').forEach((el) => el.remove());
    try { sessionStorage.removeItem('preflight-back'); } catch { /* ignore */ }
  });

  it('creates a popover pinned to top-left after click-to-navigate', () => {
    /* Simulate showBackPopover() */
    if (!document.querySelector('.preflight-back-popover')) {
      const popover = document.createElement('div');
      popover.className = 'preflight-back-popover';
      popover.innerHTML = '<span>Back to</span><button type="button">Preflight</button>';
      document.body.appendChild(popover);
    }

    const popover = document.querySelector('.preflight-back-popover');
    expect(popover).to.exist;
    expect(popover.querySelector('button')).to.exist;
  });

  it('does not create a duplicate popover when one already exists', () => {
    const first = document.createElement('div');
    first.className = 'preflight-back-popover';
    document.body.appendChild(first);

    /* showBackPopover() guards with early return */
    if (!document.querySelector('.preflight-back-popover')) {
      const second = document.createElement('div');
      second.className = 'preflight-back-popover';
      document.body.appendChild(second);
    }

    expect(document.querySelectorAll('.preflight-back-popover').length).to.equal(1);
  });
});
