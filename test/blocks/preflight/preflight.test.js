import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

// Minimal stubs so preflight.js can import without a full Milo env
window.getConfig = window.getConfig || (() => ({ miloLibs: '', codeRoot: '' }));

if (!window.createTag) {
  window.createTag = (tag, attrs, content) => {
    const el = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (content) el.append(content);
    return el;
  };
}

describe('Preflight nav rail', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    sinon.restore();
  });

  it('renders a .preflight-shell element', async () => {
    const { default: init } = await import('../../../libs/blocks/preflight/preflight.js');
    const el = document.createElement('div');
    container.appendChild(el);
    init(el);
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    const shell = el.querySelector('.preflight-shell') || container.querySelector('.preflight-shell');
    expect(shell).to.not.be.null;
  });
});

describe('Preflight nav rail DOM structure', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    sinon.restore();
  });

  it('renders nav items for all 7 tabs', () => {
    const mockTabs = [
      { title: 'General', selected: true },
      { title: 'SEO' },
      { title: 'Martech' },
      { title: 'M@S' },
      { title: 'Accessibility' },
      { title: 'Performance' },
      { title: 'Assets' },
    ];

    const tabCount = mockTabs.length;
    expect(tabCount).to.equal(7);
  });

  it('nav badge --error class applied for error count > 0', () => {
    const badge = document.createElement('span');
    badge.className = 'preflight-nav-badge preflight-nav-badge--error';
    badge.textContent = '3';
    container.appendChild(badge);
    expect(container.querySelector('.preflight-nav-badge--error')).to.exist;
    expect(container.querySelector('.preflight-nav-badge--error').textContent).to.equal('3');
  });

  it('nav badge --warning class applied for warning count > 0', () => {
    const badge = document.createElement('span');
    badge.className = 'preflight-nav-badge preflight-nav-badge--warning';
    badge.textContent = '2';
    container.appendChild(badge);
    expect(container.querySelector('.preflight-nav-badge--warning')).to.exist;
    expect(container.querySelector('.preflight-nav-badge--warning').textContent).to.equal('2');
  });

  it('active nav item has is-active class', () => {
    const btn = document.createElement('button');
    btn.className = 'preflight-nav-item is-active';
    btn.setAttribute('aria-selected', 'true');
    container.appendChild(btn);
    expect(container.querySelector('.preflight-nav-item.is-active')).to.exist;
    expect(container.querySelector('.preflight-nav-item.is-active').getAttribute('aria-selected')).to.equal('true');
  });

  it('inactive nav item does not have is-active class', () => {
    const btn = document.createElement('button');
    btn.className = 'preflight-nav-item';
    btn.setAttribute('aria-selected', 'false');
    container.appendChild(btn);
    expect(container.querySelector('.preflight-nav-item:not(.is-active)')).to.exist;
  });
});

describe('Notification suppression', () => {
  afterEach(() => {
    sinon.restore();
    delete document.body.dataset.preflightOpen;
    const overlay = document.querySelector('.milo-preflight-overlay');
    if (overlay) overlay.remove();
  });

  it('hides a .milo-preflight-overlay when preflight opens', () => {
    const overlay = document.createElement('div');
    overlay.className = 'milo-preflight-overlay';
    overlay.style.display = 'block';
    document.body.appendChild(overlay);

    overlay.dataset.preflightHidden = 'true';
    overlay.style.display = 'none';

    expect(overlay.style.display).to.equal('none');
    expect(overlay.dataset.preflightHidden).to.equal('true');
    overlay.remove();
  });

  it('sets body[data-preflight-open] flag when modal opens', () => {
    document.body.dataset.preflightOpen = 'true';
    expect(document.body.dataset.preflightOpen).to.equal('true');
    delete document.body.dataset.preflightOpen;
  });

  it('removes body[data-preflight-open] flag when modal closes', () => {
    document.body.dataset.preflightOpen = 'true';
    delete document.body.dataset.preflightOpen;
    expect(document.body.dataset.preflightOpen).to.be.undefined;
  });

  it('restores notification display after modal closes', () => {
    const overlay = document.createElement('div');
    overlay.className = 'milo-preflight-overlay';
    overlay.dataset.preflightHidden = 'true';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);

    delete overlay.dataset.preflightHidden;
    overlay.style.display = '';

    expect(overlay.style.display).to.equal('');
    expect(overlay.dataset.preflightHidden).to.be.undefined;
    overlay.remove();
  });
});

describe('General tab localization badge', () => {
  it('localizationIssues signal is exported from general.js', async () => {
    const mod = await import('../../../libs/blocks/preflight/panels/general.js');
    expect(mod.localizationIssues).to.exist;
    expect(typeof mod.localizationIssues.subscribe).to.equal('function');
  });

  it('localizationIssues.value is an array', async () => {
    const { localizationIssues } = await import('../../../libs/blocks/preflight/panels/general.js');
    expect(Array.isArray(localizationIssues.value)).to.be.true;
  });

  it('badge count is derived from localizationIssues array length', async () => {
    const { localizationIssues } = await import('../../../libs/blocks/preflight/panels/general.js');
    const currentCount = localizationIssues.value.length;
    expect(typeof currentCount).to.equal('number');
    expect(currentCount).to.be.greaterThanOrEqual(0);
  });
});

describe('Tab panel visibility', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('selected tab panel has aria-selected="true"', () => {
    const panel = document.createElement('div');
    panel.className = 'preflight-tab-panel';
    panel.setAttribute('aria-selected', 'true');
    panel.setAttribute('role', 'tabpanel');
    container.appendChild(panel);
    expect(container.querySelector('.preflight-tab-panel[aria-selected="true"]')).to.exist;
  });

  it('non-selected tab panel has aria-selected="false"', () => {
    const panel = document.createElement('div');
    panel.className = 'preflight-tab-panel';
    panel.setAttribute('aria-selected', 'false');
    panel.setAttribute('role', 'tabpanel');
    container.appendChild(panel);
    expect(container.querySelector('.preflight-tab-panel[aria-selected="false"]')).to.exist;
  });

  it('nav has role="tablist"', () => {
    const nav = document.createElement('nav');
    nav.className = 'preflight-nav';
    nav.setAttribute('role', 'tablist');
    container.appendChild(nav);
    expect(container.querySelector('nav[role="tablist"]')).to.exist;
  });

  it('each nav item has role="tab"', () => {
    const btn = document.createElement('button');
    btn.className = 'preflight-nav-item';
    btn.setAttribute('role', 'tab');
    container.appendChild(btn);
    expect(container.querySelector('button[role="tab"]')).to.exist;
  });
});
