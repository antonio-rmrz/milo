import { html, render, signal } from '../../deps/htm-preact.js';
import { getConfig } from '../../utils/utils.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const HEADING = 'Milo Preflight';
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

// Per-tab error/warning badge counts (updated by panels via window events)
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

/* SVG icons per tab — inline so no external request needed */
const TAB_ICONS = {
  General: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm0 14.5A6.5 6.5 0 1 1 9 2.5a6.5 6.5 0 0 1 0 13ZM8.25 5.5h1.5v5h-1.5Zm0 6.5h1.5v1.5h-1.5Z"/></svg>`,
  SEO: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M7.5 1a6.5 6.5 0 1 0 4.131 11.566l3.15 3.152 1.061-1.06-3.153-3.152A6.5 6.5 0 0 0 7.5 1Zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/></svg>`,
  Martech: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M9 1 1.5 5.25v7.5L9 17l7.5-4.25v-7.5Zm0 1.732 6 3.4v6.636l-6 3.4-6-3.4V6.132Z"/></svg>`,
  'M@S': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M3 3h12v1.5H3zm0 5h12v1.5H3zm0 5h8v1.5H3z"/></svg>`,
  Accessibility: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><circle cx="9" cy="3" r="1.5"/><path d="M5 5.5h8L12 8l1.5 7h-1.5L11 10l-2 1.5L7 17H5.5L7.5 11 6 10l-.5-4.5Z"/></svg>`,
  Performance: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM8.25 4v5.31l3.47 3.47 1.06-1.06-2.78-2.78V4Z"/></svg>`,
  Assets: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M1.5 1.5h15v15h-15zm1.5 1.5v12h12v-12Zm2 2h8v1.5H5zm0 3h8v1.5H5zm0 3h5v1.5H5z"/></svg>`,
};

function getBadge(title) {
  const counts = tabBadges.value[title];
  if (!counts) return null;
  const { errors = 0, warnings = 0 } = counts;
  if (errors > 0) return html`<span class="preflight-badge">${errors}</span>`;
  if (warnings > 0) return html`<span class="preflight-badge badge-warn">${warnings}</span>`;
  return null;
}

function TabButton(props) {
  const id = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  const badge = getBadge(props.tab.title);
  return html`
    <button
      id=${id}
      class="preflight-tab-button"
      key=${props.tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(props.tab)}>
      <span class="preflight-tab-icon">${TAB_ICONS[props.tab.title]}</span>
      <span class="preflight-tab-label">${props.tab.title}</span>
      ${badge}
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
      <div class="preflight-section-header">
        <p class="preflight-section-title">${props.tab.title}</p>
      </div>
      ${setPanel(props.tab.title)}
    </div>`;
}

function Preflight() {
  return html`
    <nav class="preflight-nav-rail" role="tablist" aria-label="${HEADING}">
      ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class="preflight-content">
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

/* ── Notification suppression ─────────────────────────────────────────── */
function suppressNotification() {
  const overlay = document.querySelector('.milo-preflight-overlay');
  if (overlay) {
    overlay.dataset.preflightHidden = overlay.style.display || '';
    overlay.style.display = 'none';
  }
  document.body.classList.add('preflight-open');
}

function restoreNotification() {
  const overlay = document.querySelector('.milo-preflight-overlay');
  if (overlay && 'preflightHidden' in overlay.dataset) {
    overlay.style.display = overlay.dataset.preflightHidden || '';
    delete overlay.dataset.preflightHidden;
  }
  document.body.classList.remove('preflight-open');
}

/* ── Back-to-preflight popover ─────────────────────────────────────────── */
function removeBackPopover() {
  document.querySelector('.preflight-back-popover')?.remove();
}

export function injectBackPopover(onReopen) {
  removeBackPopover();
  const popover = document.createElement('div');
  popover.className = 'preflight-back-popover';
  const btn = document.createElement('button');
  btn.className = 'preflight-back-btn';
  btn.textContent = 'Back to Preflight';
  btn.addEventListener('click', () => {
    removeBackPopover();
    onReopen();
  });
  popover.appendChild(btn);
  document.body.appendChild(popover);
}

/* ── Badge update helper (called by panels) ─────────────────────────────── */
export function updateTabBadge(title, errors, warnings) {
  tabBadges.value = { ...tabBadges.value, [title]: { errors, warnings } };
}

/* ── Preload assets (bg image kept for backwards compat) ────────────────── */
function preloadAssets(el) {
  return new Promise((resolve) => {
    const { miloLibs, codeRoot } = getConfig();
    const base = miloLibs || codeRoot;
    const check = document.createElement('link');
    check.rel = 'preload';
    check.as = 'image';
    check.href = `${base}${IMG_PATH}/check.svg`;
    const expand = document.createElement('link');
    expand.rel = 'preload';
    expand.as = 'image';
    expand.href = `${base}${IMG_PATH}/expand.svg`;
    document.head.append(check, expand);
    resolve(el);
  });
}

export default async function init(el) {
  await preloadAssets(el);
  render(html`<${Preflight} />`, el);
  suppressNotification();

  const modal = el.closest('.dialog-modal');
  if (modal) {
    const closeBtn = modal.querySelector('.dialog-close');
    closeBtn?.addEventListener('click', restoreNotification, { once: true });
    // Also watch for the modal being removed from the DOM
    const observer = new MutationObserver(() => {
      if (!document.contains(modal)) {
        restoreNotification();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
