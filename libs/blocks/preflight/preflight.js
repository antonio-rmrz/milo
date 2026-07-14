import { html, render, signal } from '../../deps/htm-preact.js';
import { createTag, getConfig } from '../../utils/utils.js';
import { tabBadges } from './preflight-state.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

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

let suppressedNotifications = [];
let modalEl;

function suppressNotifications() {
  suppressedNotifications = [...document.querySelectorAll('.milo-notification, .milo-preflight-overlay')];
  suppressedNotifications.forEach((n) => { n.dataset.preflightHidden = 'true'; n.style.display = 'none'; });
}

function restoreNotifications() {
  suppressedNotifications.forEach((n) => { n.style.display = ''; delete n.dataset.preflightHidden; });
  suppressedNotifications = [];
}

export function openPreflight() {
  if (modalEl) {
    modalEl.removeAttribute('aria-hidden');
    modalEl.style.display = '';
    suppressNotifications();
  }
}

export function closePreflight() {
  restoreNotifications();
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

function getNavIcon(title) {
  const svgAttrs = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    General: `<svg ${svgAttrs}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    SEO: `<svg ${svgAttrs}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    Martech: `<svg ${svgAttrs}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    'M@S': `<svg ${svgAttrs}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
    Accessibility: `<svg ${svgAttrs}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`,
    Performance: `<svg ${svgAttrs}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    Assets: `<svg ${svgAttrs}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  };
  return icons[title] || icons.General;
}

function NavBadge({ count, type }) {
  if (!count) return null;
  return html`<span class="preflight-nav-badge preflight-nav-badge-${type}">${count}</span>`;
}

function NavItem({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const badge = tabBadges.value[tab.title] || {};
  return html`
    <button
      id=${id}
      class="preflight-nav-item${selected ? ' is-active' : ''}"
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <span class="preflight-nav-icon" dangerouslySetInnerHTML=${{ __html: getNavIcon(tab.title) }}></span>
      <span class="preflight-nav-label">${tab.title}</span>
      ${badge.errors ? html`<${NavBadge} count=${badge.errors} type="error" />` : null}
      ${!badge.errors && badge.warnings ? html`<${NavBadge} count=${badge.warnings} type="warning" />` : null}
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
  return html`
    <nav class="preflight-nav" role="tablist" aria-label="Preflight sections">
      ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class="preflight-content">
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

function preloadAssets(el) {
  return new Promise((resolve) => {
    const { miloLibs, codeRoot } = getConfig();
    const base = miloLibs || codeRoot;
    const check = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/check.svg` });
    const expand = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/expand.svg` });
    document.head.append(check, expand);
    resolve(el);
  });
}

export default async function init(el) {
  modalEl = el;
  await preloadAssets(el);
  suppressNotifications();
  render(html`<${Preflight} />`, el);

  const dialog = el.closest('dialog, .dialog-modal');
  if (dialog) {
    const observer = new MutationObserver(() => {
      const hidden = dialog.getAttribute('aria-hidden') === 'true'
        || dialog.style.display === 'none'
        || !document.body.contains(dialog);
      if (hidden) restoreNotifications();
      else suppressNotifications();
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ['aria-hidden', 'style'] });
    observer.observe(document.body, { childList: true });
  }
}
