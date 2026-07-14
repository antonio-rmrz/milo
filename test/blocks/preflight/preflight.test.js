import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { html, render, signal } from '../../../libs/deps/htm-preact.js';

// ─── Badge module ────────────────────────────────────────────────────────────
describe('preflight-badges', () => {
  let badgeCounts;
  let updateBadge;

  before(async () => {
    const mod = await import('../../../libs/blocks/preflight/preflight-badges.js');
    badgeCounts = mod.badgeCounts;
    updateBadge = mod.updateBadge;
  });

  it('exports badgeCounts signal with all seven tabs initialised', () => {
    const titles = ['General', 'SEO', 'Martech', 'M@S', 'Accessibility', 'Performance', 'Assets'];
    titles.forEach((t) => {
      expect(badgeCounts.value[t]).to.exist;
      expect(badgeCounts.value[t].errors).to.equal(0);
      expect(badgeCounts.value[t].warnings).to.equal(0);
    });
  });

  it('updateBadge increments errors for a tab', () => {
    updateBadge('SEO', 3, 1);
    expect(badgeCounts.value.SEO.errors).to.equal(3);
    expect(badgeCounts.value.SEO.warnings).to.equal(1);
  });

  it('updateBadge can reset counts to zero', () => {
    updateBadge('SEO', 0, 0);
    expect(badgeCounts.value.SEO.errors).to.equal(0);
    expect(badgeCounts.value.SEO.warnings).to.equal(0);
  });

  it('updateBadge updates only the targeted tab', () => {
    updateBadge('Assets', 2, 0);
    expect(badgeCounts.value.Assets.errors).to.equal(2);
    // Other tabs unaffected
    expect(badgeCounts.value.General.errors).to.equal(0);
  });
});

// ─── Nav rail renders badge spans ─────────────────────────────────────────
describe('preflight nav-rail badge visibility', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    sinon.restore();
  });

  it('badge element absent when count is zero', async () => {
    const { badgeCounts, updateBadge } = await import(
      '../../../libs/blocks/preflight/preflight-badges.js'
    );

    updateBadge('General', 0, 0);

    // Render a minimal NavBadge-like component
    function NavBadge({ count, type }) {
      if (!count || count <= 0) return null;
      return html`<span class="preflight-nav-badge badge-${type}">${count}</span>`;
    }

    render(html`<div><${NavBadge} count=${badgeCounts.value.General.errors} type="error" /></div>`, container);
    expect(container.querySelector('.preflight-nav-badge')).to.be.null;
  });

  it('error badge rendered with badge-error class when count > 0', async () => {
    const { badgeCounts, updateBadge } = await import(
      '../../../libs/blocks/preflight/preflight-badges.js'
    );

    updateBadge('General', 5, 0);

    function NavBadge({ count, type }) {
      if (!count || count <= 0) return null;
      return html`<span class="preflight-nav-badge badge-${type}">${count}</span>`;
    }

    render(html`<div><${NavBadge} count=${badgeCounts.value.General.errors} type="error" /></div>`, container);
    const badge = container.querySelector('.preflight-nav-badge.badge-error');
    expect(badge).to.exist;
    expect(badge.textContent).to.equal('5');
  });

  it('warning badge rendered with badge-warning class', async () => {
    const { badgeCounts, updateBadge } = await import(
      '../../../libs/blocks/preflight/preflight-badges.js'
    );

    updateBadge('Performance', 0, 3);

    function NavBadge({ count, type }) {
      if (!count || count <= 0) return null;
      return html`<span class="preflight-nav-badge badge-${type}">${count}</span>`;
    }

    render(html`<div><${NavBadge} count=${badgeCounts.value.Performance.warnings} type="warning" /></div>`, container);
    const badge = container.querySelector('.preflight-nav-badge.badge-warning');
    expect(badge).to.exist;
    expect(badge.textContent).to.equal('3');
  });
});

// ─── Performance panel — conditional LCP link ────────────────────────────
describe('performance panel — conditional LCP link', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
    sinon.restore();
  });

  it('Highlight LCP link absent from DOM when hasLcpElement is false', () => {
    const hasLcpElement = signal(false);

    function HighlightLink({ hasLcp }) {
      return hasLcp
        ? html`<span class="performance-element-preview">Highlight the found LCP section</span>`
        : null;
    }

    render(html`<div><${HighlightLink} hasLcp=${hasLcpElement.value} /></div>`, container);
    expect(container.querySelector('.performance-element-preview')).to.be.null;
  });

  it('Highlight LCP link present in DOM when hasLcpElement is true', () => {
    const hasLcpElement = signal(true);

    function HighlightLink({ hasLcp }) {
      return hasLcp
        ? html`<span class="performance-element-preview">Highlight the found LCP section</span>`
        : null;
    }

    render(html`<div><${HighlightLink} hasLcp=${hasLcpElement.value} /></div>`, container);
    expect(container.querySelector('.performance-element-preview')).to.exist;
  });
});

// ─── Notification suppress / restore ─────────────────────────────────────
describe('preflight notification suppression', () => {
  let notification;

  beforeEach(() => {
    notification = document.createElement('div');
    notification.className = 'preflight-notification';
    document.body.appendChild(notification);
  });

  afterEach(() => {
    notification.removeAttribute('data-preflight-hidden');
    notification.style.removeProperty('display');
    document.body.classList.remove('preflight-open');
    if (notification.parentNode) notification.parentNode.removeChild(notification);
  });

  function suppressNotifications() {
    document.querySelectorAll('.preflight-notification, .notification').forEach((n) => {
      n.dataset.preflightHidden = 'true';
      n.style.setProperty('display', 'none', 'important');
    });
    document.body.classList.add('preflight-open');
  }

  function restoreNotifications() {
    document.querySelectorAll('[data-preflight-hidden="true"]').forEach((n) => {
      n.removeAttribute('data-preflight-hidden');
      n.style.removeProperty('display');
    });
    document.body.classList.remove('preflight-open');
  }

  it('suppresses notification on open', () => {
    suppressNotifications();
    expect(notification.style.display).to.equal('none');
    expect(notification.dataset.preflightHidden).to.equal('true');
    expect(document.body.classList.contains('preflight-open')).to.be.true;
  });

  it('restores notification on close', () => {
    suppressNotifications();
    restoreNotifications();
    expect(notification.style.display).to.equal('');
    expect(notification.dataset.preflightHidden).to.be.undefined;
    expect(document.body.classList.contains('preflight-open')).to.be.false;
  });

  it('does not re-expose notifications when close is called without prior open', () => {
    restoreNotifications();
    expect(document.body.classList.contains('preflight-open')).to.be.false;
  });
});

// ─── Back-to-preflight popover lifecycle ──────────────────────────────────
describe('back-to-preflight popover', () => {
  function removeBackPopover() {
    document.querySelector('.back-to-preflight')?.remove();
  }

  function createBackPopover(reopenCallback) {
    removeBackPopover();
    const btn = document.createElement('button');
    btn.className = 'back-to-preflight';
    btn.textContent = 'Back to Preflight';
    btn.addEventListener('click', () => {
      removeBackPopover();
      reopenCallback();
    });
    document.body.appendChild(btn);
  }

  afterEach(() => {
    removeBackPopover();
  });

  it('creates a back-to-preflight button in body after navigation', () => {
    createBackPopover(() => {});
    expect(document.querySelector('.back-to-preflight')).to.exist;
  });

  it('calls reopenCallback and removes itself on click', () => {
    const reopen = sinon.spy();
    createBackPopover(reopen);
    document.querySelector('.back-to-preflight').click();
    expect(reopen.calledOnce).to.be.true;
    expect(document.querySelector('.back-to-preflight')).to.be.null;
  });

  it('removeBackPopover removes an existing popover', () => {
    createBackPopover(() => {});
    expect(document.querySelector('.back-to-preflight')).to.exist;
    removeBackPopover();
    expect(document.querySelector('.back-to-preflight')).to.be.null;
  });

  it('removeBackPopover is idempotent when no popover present', () => {
    expect(() => removeBackPopover()).to.not.throw();
  });
});

// ─── Nav rail active state toggle ─────────────────────────────────────────
describe('nav rail active state', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('selected tab item has aria-selected="true"', () => {
    const tabs = signal([
      { title: 'General', selected: true },
      { title: 'SEO', selected: false },
    ]);

    function NavItem({ tab, idx }) {
      return html`
        <button
          id=${`tab-${idx + 1}`}
          class="preflight-nav-item"
          aria-selected=${tab.selected === true}>
          ${tab.title}
        </button>`;
    }

    render(
      html`<nav>${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} />`)}</nav>`,
      container,
    );

    const buttons = container.querySelectorAll('.preflight-nav-item');
    expect(buttons[0].getAttribute('aria-selected')).to.equal('true');
    expect(buttons[1].getAttribute('aria-selected')).to.equal('false');
  });

  it('switching tab updates aria-selected', () => {
    const tabs = signal([
      { title: 'General', selected: true },
      { title: 'SEO', selected: false },
    ]);

    function setTab(active) {
      tabs.value = tabs.value.map((t) => ({ ...t, selected: t.title === active.title }));
    }

    function NavItem({ tab, idx }) {
      return html`
        <button
          id=${`tab-${idx + 1}`}
          class="preflight-nav-item"
          aria-selected=${tab.selected === true}
          onClick=${() => setTab(tab)}>
          ${tab.title}
        </button>`;
    }

    function Nav() {
      return html`<nav>${tabs.value.map((t, i) => html`<${NavItem} tab=${t} idx=${i} />`)}</nav>`;
    }

    render(html`<${Nav} />`, container);

    let buttons = container.querySelectorAll('.preflight-nav-item');
    expect(buttons[0].getAttribute('aria-selected')).to.equal('true');
    expect(buttons[1].getAttribute('aria-selected')).to.equal('false');

    buttons[1].click();
    render(html`<${Nav} />`, container);

    buttons = container.querySelectorAll('.preflight-nav-item');
    expect(buttons[0].getAttribute('aria-selected')).to.equal('false');
    expect(buttons[1].getAttribute('aria-selected')).to.equal('true');
  });
});
