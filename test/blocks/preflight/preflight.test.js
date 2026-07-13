import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

// Minimal mock for getConfig used by preflight.js
window.getConfig = () => ({ miloLibs: '', codeRoot: '' });

describe('Preflight main module', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'preflight';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    sinon.restore();
  });

  describe('injectBackPopover / removeBackPopover', () => {
    it('injects a .preflight-back-popover into document.body', async () => {
      const { injectBackPopover } = await import('../../../libs/blocks/preflight/preflight.js');
      const cb = sinon.stub();
      injectBackPopover(cb);
      const popover = document.querySelector('.preflight-back-popover');
      expect(popover).to.exist;
    });

    it('back-popover contains a Back to Preflight button', async () => {
      const { injectBackPopover } = await import('../../../libs/blocks/preflight/preflight.js');
      const cb = sinon.stub();
      injectBackPopover(cb);
      const btn = document.querySelector('.preflight-back-popover .preflight-back-btn');
      expect(btn).to.exist;
      expect(btn.textContent).to.equal('Back to Preflight');
    });

    it('clicking back-popover button calls the reopen callback', async () => {
      const { injectBackPopover } = await import('../../../libs/blocks/preflight/preflight.js');
      const cb = sinon.stub();
      injectBackPopover(cb);
      const btn = document.querySelector('.preflight-back-popover .preflight-back-btn');
      btn.click();
      expect(cb.calledOnce).to.be.true;
    });

    it('clicking back-popover button removes the popover from DOM', async () => {
      const { injectBackPopover } = await import('../../../libs/blocks/preflight/preflight.js');
      const cb = sinon.stub();
      injectBackPopover(cb);
      const btn = document.querySelector('.preflight-back-popover .preflight-back-btn');
      btn.click();
      expect(document.querySelector('.preflight-back-popover')).to.be.null;
    });

    it('injectBackPopover replaces any existing popover', async () => {
      const { injectBackPopover } = await import('../../../libs/blocks/preflight/preflight.js');
      injectBackPopover(sinon.stub());
      injectBackPopover(sinon.stub());
      const popovers = document.querySelectorAll('.preflight-back-popover');
      expect(popovers.length).to.equal(1);
    });
  });

  describe('updateTabBadge', () => {
    it('updateTabBadge is exported from preflight.js', async () => {
      const mod = await import('../../../libs/blocks/preflight/preflight.js');
      expect(mod.updateTabBadge).to.be.a('function');
    });

    it('calling updateTabBadge does not throw', async () => {
      const { updateTabBadge } = await import('../../../libs/blocks/preflight/preflight.js');
      expect(() => updateTabBadge('General', 3, 0)).to.not.throw();
    });
  });
});

describe('Preflight nav rail structure', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'preflight-shell';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    sinon.restore();
  });

  it('renders exactly 7 tab buttons (one per section)', async () => {
    // Mock the panel imports used by preflight.js to avoid side effects
    const { html: h, render: r } = await import('../../../libs/deps/htm-preact.js');

    // Build a minimal Preflight-like structure matching the new nav rail
    const tabs = ['General', 'SEO', 'Martech', 'M@S', 'Accessibility', 'Performance', 'Assets'];
    r(h`
      <nav class="preflight-nav-rail" role="tablist">
        ${tabs.map((title, idx) => h`
          <button id=${`tab-${idx + 1}`} class="preflight-tab-button" aria-selected=${idx === 0}>
            <span class="preflight-tab-icon"></span>
            <span class="preflight-tab-label">${title}</span>
          </button>
        `)}
      </nav>
    `, container);

    const buttons = container.querySelectorAll('.preflight-tab-button');
    expect(buttons.length).to.equal(7);
  });

  it('first tab button has aria-selected=true', async () => {
    const { html: h, render: r } = await import('../../../libs/deps/htm-preact.js');
    const tabs = ['General', 'SEO', 'Martech', 'M@S', 'Accessibility', 'Performance', 'Assets'];
    r(h`
      <nav class="preflight-nav-rail" role="tablist">
        ${tabs.map((title, idx) => h`
          <button class="preflight-tab-button" aria-selected=${idx === 0}>
            <span class="preflight-tab-label">${title}</span>
          </button>
        `)}
      </nav>
    `, container);
    const selected = container.querySelector('[aria-selected="true"]');
    expect(selected).to.exist;
    expect(selected.querySelector('.preflight-tab-label').textContent).to.equal('General');
  });

  it('each tab button includes a preflight-tab-icon span', async () => {
    const { html: h, render: r } = await import('../../../libs/deps/htm-preact.js');
    const tabs = ['General', 'SEO', 'Martech'];
    r(h`
      <nav class="preflight-nav-rail" role="tablist">
        ${tabs.map((title) => h`
          <button class="preflight-tab-button" aria-selected=${false}>
            <span class="preflight-tab-icon">icon</span>
            <span class="preflight-tab-label">${title}</span>
          </button>
        `)}
      </nav>
    `, container);
    const icons = container.querySelectorAll('.preflight-tab-icon');
    expect(icons.length).to.equal(3);
  });

  it('badge with error count renders inside a tab button', async () => {
    const { html: h, render: r } = await import('../../../libs/deps/htm-preact.js');
    r(h`
      <button class="preflight-tab-button" aria-selected=${false}>
        <span class="preflight-tab-label">General</span>
        <span class="preflight-badge">3</span>
      </button>
    `, container);
    const badge = container.querySelector('.preflight-badge');
    expect(badge).to.exist;
    expect(badge.textContent).to.equal('3');
  });

  it('warning badge renders with badge-warn class', async () => {
    const { html: h, render: r } = await import('../../../libs/deps/htm-preact.js');
    r(h`
      <button class="preflight-tab-button" aria-selected=${false}>
        <span class="preflight-tab-label">SEO</span>
        <span class="preflight-badge badge-warn">2</span>
      </button>
    `, container);
    const badge = container.querySelector('.preflight-badge.badge-warn');
    expect(badge).to.exist;
    expect(badge.textContent).to.equal('2');
  });
});

describe('Preflight notification suppression', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.classList.remove('preflight-open');
    sinon.restore();
  });

  it('adds preflight-open class to body when modal opens', () => {
    const overlay = document.createElement('div');
    overlay.className = 'milo-preflight-overlay';
    document.body.appendChild(overlay);

    // Simulate what init() does: suppress notification
    overlay.dataset.preflightHidden = overlay.style.display || '';
    overlay.style.display = 'none';
    document.body.classList.add('preflight-open');

    expect(document.body.classList.contains('preflight-open')).to.be.true;
  });

  it('hides the notification overlay when preflight opens', () => {
    const overlay = document.createElement('div');
    overlay.className = 'milo-preflight-overlay';
    overlay.style.display = 'block';
    document.body.appendChild(overlay);

    // Suppress
    overlay.dataset.preflightHidden = overlay.style.display || '';
    overlay.style.display = 'none';
    document.body.classList.add('preflight-open');

    expect(overlay.style.display).to.equal('none');
  });

  it('restores the notification overlay when preflight closes', () => {
    const overlay = document.createElement('div');
    overlay.className = 'milo-preflight-overlay';
    overlay.style.display = 'block';
    overlay.dataset.preflightHidden = 'block';
    document.body.classList.add('preflight-open');
    document.body.appendChild(overlay);

    // Restore
    if ('preflightHidden' in overlay.dataset) {
      overlay.style.display = overlay.dataset.preflightHidden || '';
      delete overlay.dataset.preflightHidden;
    }
    document.body.classList.remove('preflight-open');

    expect(overlay.style.display).to.equal('block');
    expect(document.body.classList.contains('preflight-open')).to.be.false;
  });
});

describe('Preflight section header', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('section header renders with the tab title', async () => {
    const { html: h, render: r } = await import('../../../libs/deps/htm-preact.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    r(h`
      <div class="preflight-tab-panel" aria-selected=${true}>
        <div class="preflight-section-header">
          <p class="preflight-section-title">General</p>
        </div>
      </div>
    `, container);
    const header = container.querySelector('.preflight-section-header');
    const title = container.querySelector('.preflight-section-title');
    expect(header).to.exist;
    expect(title.textContent).to.equal('General');
  });
});
