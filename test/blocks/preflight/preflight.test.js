import { expect } from '@esm-bundle/chai';
import { html, render } from '../../../libs/deps/htm-preact.js';
import { setConfig } from '../../../libs/utils/utils.js';
import init from '../../../libs/blocks/preflight/preflight.js';
import { getBadgeCounts as getGeneralBadgeCounts, localizationIssues } from '../../../libs/blocks/preflight/panels/general.js';
import Performance from '../../../libs/blocks/preflight/panels/performance.js';
import { navigateToAsset } from '../../../libs/blocks/preflight/panels/assets.js';
import { getLcpEntry } from '../../../libs/blocks/preflight/checks/performance.js';

const HIDDEN_CLASS = 'preflight-notification-hidden';

function delay(ms = 10) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function mountPreflight() {
  const dialog = document.createElement('div');
  dialog.className = 'dialog-modal';
  dialog.id = 'preflight';
  const el = document.createElement('div');
  el.className = 'preflight';
  dialog.append(el);
  await init(el);
  document.body.append(dialog);
  await delay();
  return { dialog, el };
}

describe('Preflight', () => {
  before(() => {
    setConfig({ georouting: { enabled: 'off' } });
    // Resolve the LCP entry deterministically so performance checks settle.
    getLcpEntry(window.location.pathname, document, () => Promise.resolve(null));
  });

  describe('nav rail', () => {
    it('renders icons, labels, and aria-current on the active item', async () => {
      const { dialog, el } = await mountPreflight();

      expect(el.querySelector('.preflight-shell')).to.exist;
      expect(el.querySelector('nav.preflight-nav-rail')).to.exist;

      const buttons = el.querySelectorAll('button.preflight-tab-button');
      expect(buttons.length).to.equal(7);
      buttons.forEach((button) => {
        expect(button.querySelector('.preflight-nav-icon')).to.exist;
        expect(button.querySelector('.preflight-nav-label')).to.exist;
      });

      const active = el.querySelector('button.preflight-tab-button[aria-selected="true"]');
      expect(active.getAttribute('aria-current')).to.equal('page');
      expect(active.textContent).to.include('General');
      expect(el.querySelector('.preflight-section-title').textContent).to.equal('General');

      const inactive = el.querySelector('button.preflight-tab-button[aria-selected="false"]');
      expect(inactive.hasAttribute('aria-current')).to.be.false;

      // Switching tabs moves aria-current and updates the section header.
      const seoButton = [...buttons].find((button) => button.textContent.includes('SEO'));
      seoButton.click();
      await delay();
      expect(seoButton.getAttribute('aria-selected')).to.equal('true');
      expect(seoButton.getAttribute('aria-current')).to.equal('page');
      expect(el.querySelector('.preflight-section-title').textContent).to.equal('SEO');

      [...el.querySelectorAll('button.preflight-tab-button')]
        .find((button) => button.textContent.includes('General')).click();
      await delay();
      dialog.remove();
      await delay();
    });
  });

  describe('notification suppression', () => {
    it('hides the page notification while open and restores it on close', async () => {
      const overlay = document.createElement('div');
      overlay.className = 'milo-preflight-overlay';
      document.body.append(overlay);

      const { dialog } = await mountPreflight();
      expect(overlay.classList.contains(HIDDEN_CLASS)).to.be.true;

      // A notification injected while the modal is open is suppressed too.
      const second = document.createElement('div');
      second.className = 'milo-preflight-overlay';
      document.body.append(second);
      await delay();
      expect(second.classList.contains(HIDDEN_CLASS)).to.be.true;

      dialog.remove();
      await delay();
      expect(overlay.classList.contains(HIDDEN_CLASS)).to.be.false;
      expect(second.classList.contains(HIDDEN_CLASS)).to.be.false;

      overlay.remove();
      second.remove();
    });
  });

  describe('general badge', () => {
    it('counts localization faulty links as errors', () => {
      const before = getGeneralBadgeCounts();
      localizationIssues.value = [
        { url: '/one' },
        { url: '/two' },
        { url: '/three' },
      ];
      const after = getGeneralBadgeCounts();
      expect(after.errors - before.errors).to.equal(3);
      localizationIssues.value = [];
    });
  });

  describe('performance LCP link', () => {
    const originalUrl = window.location.href;
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.append(container);
    });

    afterEach(() => {
      render(null, container);
      container.remove();
      window.history.replaceState({}, '', originalUrl);
    });

    it('does not render the Highlight LCP link when no LCP element exists', async () => {
      window.history.pushState({}, '', '/preflight-test-no-lcp');
      getLcpEntry('/preflight-test-no-lcp', document, () => Promise.resolve(null));
      render(html`<${Performance} />`, container);
      await delay(30);
      expect(container.querySelector('.performance-element-preview')).to.not.exist;
    });

    it('renders the Highlight LCP link when an LCP element exists', async () => {
      window.history.pushState({}, '', '/preflight-test-has-lcp');
      const lcpTarget = document.createElement('img');
      getLcpEntry('/preflight-test-has-lcp', document, () => Promise.resolve({ element: lcpTarget }));
      render(html`<${Performance} />`, container);
      await delay(30);
      expect(container.querySelector('.performance-element-preview')).to.exist;
    });
  });

  describe('assets click-to-navigate', () => {
    it('closes the modal, scrolls to the asset, and shows the back popover', async () => {
      const dialog = document.createElement('div');
      dialog.className = 'dialog-modal';
      dialog.id = 'preflight';
      document.body.append(dialog);

      const target = document.createElement('img');
      document.body.append(target);
      let scrolled = false;
      target.scrollIntoView = () => {
        scrolled = true;
      };

      await navigateToAsset(target);

      expect(document.querySelector('.dialog-modal#preflight')).to.not.exist;
      expect(scrolled).to.be.true;
      const popover = document.querySelector('.preflight-back-popover');
      expect(popover).to.exist;
      expect(popover.textContent).to.include('Back to Preflight');
      target.remove();
    });

    it('removes the popover and re-opens preflight when clicked', async () => {
      const popover = document.querySelector('.preflight-back-popover');
      expect(popover).to.exist;

      const sidekick = document.createElement('helix-sidekick');
      document.body.append(sidekick);
      const reopened = new Promise((resolve) => {
        sidekick.addEventListener('custom:preflight', resolve, { once: true });
      });

      popover.querySelector('button').click();
      expect(document.querySelector('.preflight-back-popover')).to.not.exist;
      await reopened;
      sidekick.remove();
    });
  });
});
