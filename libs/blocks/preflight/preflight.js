import { html, render, signal, useEffect } from '../../deps/htm-preact.js';
import { createTag, getConfig } from '../../utils/utils.js';
import General, { localizationIssues } from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const HEADING = 'Preflight';
const IMG_PATH = '/blocks/preflight/img';

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

function NavBadge({ count, type }) {
  if (!count) return null;
  return html`<span class="preflight-nav-badge preflight-nav-badge--${type}">${count}</span>`;
}

function NavItem({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.tab.selected === true;
  const badge = tabBadges.value[tab.tab.title];
  return html`
    <button
      id=${id}
      class="preflight-nav-item${selected ? ' is-active' : ''}"
      key=${tab.tab.title}
      aria-selected=${selected}
      role="tab"
      onClick=${() => setTab(tab.tab)}>
      <span class="preflight-nav-label">${tab.tab.title}</span>
      ${badge?.errors > 0 && html`<${NavBadge} count=${badge.errors} type="error" />`}
      ${badge?.errors === 0 && badge?.warnings > 0 && html`<${NavBadge} count=${badge.warnings} type="warning" />`}
    </button>`;
}

function TabPanel({ tab, idx }) {
  const id = `panel-${idx + 1}`;
  const labeledBy = `tab-${idx + 1}`;
  const selected = tab.selected === true;

  return html`
    <div
      id=${id}
      class=preflight-tab-panel
      aria-labelledby=${labeledBy}
      key=${tab.title}
      aria-selected=${selected}
      role="tabpanel">
      ${setPanel(tab.title)}
    </div>`;
}

function Preflight() {
  useEffect(() => {
    // Update General tab badge with localization issue count
    const update = () => {
      const count = localizationIssues.value.length;
      const current = tabBadges.value.General || {};
      if (current.errors !== count) {
        tabBadges.value = {
          ...tabBadges.value,
          General: { errors: count, warnings: 0 },
        };
      }
    };
    // Poll once initially and re-run when localizationIssues changes
    const unsubscribe = localizationIssues.subscribe(update);
    return unsubscribe;
  }, []);

  return html`
    <div class="preflight-shell">
      <nav class="preflight-nav" role="tablist" aria-label=${HEADING}>
        <p class="preflight-nav-heading">${HEADING}</p>
        ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${{ tab }} idx=${idx} />`)}
      </nav>
      <div class="preflight-content">
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

function suppressNotification() {
  const notification = document.querySelector('.milo-preflight-overlay');
  if (notification) {
    notification.dataset.preflightHidden = 'true';
    notification.style.display = 'none';
  }
  document.body.dataset.preflightOpen = 'true';
}

function restoreNotification() {
  const notification = document.querySelector('.milo-preflight-overlay');
  if (notification && notification.dataset.preflightHidden) {
    delete notification.dataset.preflightHidden;
    notification.style.display = '';
  }
  delete document.body.dataset.preflightOpen;
}

function preloadAssets() {
  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs || codeRoot;
  const check = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/check.svg` });
  const expand = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/expand.svg` });
  document.head.append(check, expand);
}

function observeModalClose(el) {
  const modal = el.closest('.dialog-modal');
  if (!modal) return;
  const observer = new MutationObserver(() => {
    if (!document.body.contains(modal) || modal.hidden) {
      restoreNotification();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  modal.addEventListener('close', restoreNotification, { once: true });
}

export default function init(el) {
  suppressNotification();
  observeModalClose(el);
  preloadAssets();
  render(html`<${Preflight} />`, el);
}
