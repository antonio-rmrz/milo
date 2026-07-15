import { html, render, signal } from '../../deps/htm-preact.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const tabs = signal([
  { title: 'General', selected: true },
  { title: 'SEO' },
  { title: 'Martech' },
  { title: 'M@S' },
  { title: 'Accessibility' },
  { title: 'Performance' },
  { title: 'Assets' },
]);

const tabBadges = signal({});

export function updateTabBadge(title, count, type) {
  tabBadges.value = { ...tabBadges.value, [title]: { count, type } };
}

function handleBadgeEvent(e) {
  const { title, count, type } = e.detail;
  updateTabBadge(title, count, type);
}

function setTab(active) {
  tabs.value = tabs.value.map((tab) => {
    const selected = tab.title === active.title;
    return { ...tab, selected };
  });
}

function setPanel(title) {
  switch (title) {
    case 'General':
      return html`<${General} />`;
    case 'SEO':
      return html`<${SEO} />`;
    case 'Martech':
      return html`<${Martech} />`;
    case 'M@S':
      return html`<${Merch} />`;
    case 'Accessibility':
      return html`<${Accessibility} />`;
    case 'Performance':
      return html`<${Performance} />`;
    case 'Assets':
      return html`<${Assets} />`;
    default:
      return html`<p>No matching panel.</p>`;
  }
}

function NavButton(props) {
  const id = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  const badge = tabBadges.value[props.tab.title];
  const hasCount = badge && badge.count > 0;
  let badgeClass = 'preflight-nav-badge';
  if (hasCount) badgeClass = badge.type === 'error' ? 'preflight-nav-badge badge-error' : 'preflight-nav-badge badge-warn';

  return html`
    <button
      id=${id}
      class="preflight-nav-btn"
      key=${props.tab.title}
      aria-selected=${selected}
      role="tab"
      onClick=${() => setTab(props.tab)}>
      ${props.tab.title}
      ${hasCount && html`<span class=${badgeClass}>${badge.count}</span>`}
    </button>`;
}

function TabPanel(props) {
  const id = `panel-${props.idx + 1}`;
  const labeledBy = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;

  return html`
    <div
      id=${id}
      class="preflight-tab-panel"
      aria-labelledby=${labeledBy}
      key=${props.tab.title}
      aria-selected=${selected}
      role="tabpanel">
      ${setPanel(props.tab.title)}
    </div>`;
}

function Preflight() {
  return html`
    <nav class="preflight-nav-rail" role="tablist" aria-label="Preflight sections">
      ${tabs.value.map((tab, idx) => html`<${NavButton} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class="preflight-content">
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

function dismissNotification() {
  document.querySelector('.milo-preflight-overlay')?.remove();
}

function suppressNotificationWhileOpen(dialogEl) {
  window.preflightNotificationSuppressed = () => true;

  const cleanup = () => {
    window.preflightNotificationSuppressed = null;
  };

  dialogEl.addEventListener('close', cleanup, { once: true });

  const observer = new MutationObserver(() => {
    if (!document.body.contains(dialogEl)) {
      cleanup();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: false });
}

export default async function init(el) {
  dismissNotification();
  const dialogEl = el.closest('dialog') || el;
  suppressNotificationWhileOpen(dialogEl);

  document.addEventListener('preflight:badge', handleBadgeEvent);
  dialogEl.addEventListener('close', () => {
    document.removeEventListener('preflight:badge', handleBadgeEvent);
  }, { once: true });

  render(html`<${Preflight} />`, el);
}
