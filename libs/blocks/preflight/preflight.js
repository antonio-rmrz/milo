import { html, render, signal } from '../../deps/htm-preact.js';
import { createTag, getConfig } from '../../utils/utils.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const HEADING = 'Milo Preflight';
const IMG_PATH = '/blocks/preflight/img';

// ── Notification suppression ──────────────────────────────────────────
let suppressedNotification = null;
export let isPreflightOpen = false;

export function suppressNotification() {
  if (suppressedNotification) return; // idempotent
  const notif = document.querySelector('.block-notification, [class*="block-notification"]');
  if (notif && notif.style.display !== 'none') {
    suppressedNotification = notif;
    notif.dataset.preflightHidden = 'true';
    notif.style.display = 'none';
  }
}

export function restoreNotification() {
  if (!suppressedNotification) return;
  suppressedNotification.style.display = '';
  delete suppressedNotification.dataset.preflightHidden;
  suppressedNotification = null;
}

// ── Tab state ─────────────────────────────────────────────────────────
const tabs = signal([
  { title: 'General',       icon: '⚙', selected: true,  errorCount: 0, warnCount: 0 },
  { title: 'SEO',           icon: '🔍', selected: false, errorCount: 0, warnCount: 0 },
  { title: 'Martech',       icon: '📊', selected: false, errorCount: 0, warnCount: 0 },
  { title: 'M@S',           icon: '🛒', selected: false, errorCount: 0, warnCount: 0 },
  { title: 'Accessibility', icon: '♿', selected: false, errorCount: 0, warnCount: 0 },
  { title: 'Performance',   icon: '⚡', selected: false, errorCount: 0, warnCount: 0 },
  { title: 'Assets',        icon: '🖼', selected: false, errorCount: 0, warnCount: 0 },
]);

export function setTab(active) {
  tabs.value = tabs.value.map((tab) => ({
    ...tab,
    selected: tab.title === active.title,
  }));
}

/**
 * Update badge counts for a given tab title.
 * @param {string} title - Tab title
 * @param {number} errorCount
 * @param {number} warnCount
 */
export function updateTabBadge(title, errorCount, warnCount) {
  tabs.value = tabs.value.map((tab) => {
    if (tab.title !== title) return tab;
    return { ...tab, errorCount: errorCount || 0, warnCount: warnCount || 0 };
  });
}

function setPanel(title) {
  switch (title) {
    case 'General':       return html`<${General} />`;
    case 'SEO':           return html`<${SEO} />`;
    case 'Martech':       return html`<${Martech} />`;
    case 'M@S':           return html`<${Merch} />`;
    case 'Accessibility': return html`<${Accessibility} />`;
    case 'Performance':   return html`<${Performance} />`;
    case 'Assets':        return html`<${Assets} />`;
    default:              return html`<p>No matching panel.</p>`;
  }
}

// ── Nav badge element ─────────────────────────────────────────────────
function NavBadge({ errorCount, warnCount }) {
  const count = errorCount + warnCount;
  if (count === 0) return null;
  const severity = errorCount > 0 ? 'error' : 'warning';
  return html`
    <span class="preflight-nav-badge" data-severity=${severity}>
      ${count}
    </span>`;
}

// ── Rail button (≥900px) ──────────────────────────────────────────────
function RailButton({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  return html`
    <button
      id=${id}
      class="preflight-nav-rail-btn"
      role="tab"
      aria-selected=${String(selected)}
      tabindex=${selected ? '0' : '-1'}
      onClick=${() => setTab(tab)}>
      <span class="preflight-nav-icon" aria-hidden="true">${tab.icon}</span>
      <span class="preflight-nav-label">${tab.title}</span>
      <${NavBadge} errorCount=${tab.errorCount} warnCount=${tab.warnCount} />
    </button>`;
}

// ── Top-nav button (<900px) ───────────────────────────────────────────
function TopNavButton({ tab, idx }) {
  const id = `top-tab-${idx + 1}`;
  const selected = tab.selected === true;
  return html`
    <button
      id=${id}
      class="preflight-top-nav-btn"
      role="tab"
      aria-selected=${String(selected)}
      tabindex=${selected ? '0' : '-1'}
      onClick=${() => setTab(tab)}>
      <span aria-hidden="true">${tab.icon}</span>
      <span>${tab.title}</span>
      <${NavBadge} errorCount=${tab.errorCount} warnCount=${tab.warnCount} />
    </button>`;
}

// ── Tab panel ─────────────────────────────────────────────────────────
function TabPanel({ tab, idx }) {
  const id = `panel-${idx + 1}`;
  const labeledBy = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  return html`
    <div
      id=${id}
      class="preflight-tab-panel"
      aria-labelledby=${labeledBy}
      aria-selected=${String(selected)}
      role="tabpanel">
      ${setPanel(tab.title)}
    </div>`;
}

// ── Root component ────────────────────────────────────────────────────
function Preflight() {
  return html`
    <div class="preflight-modal">
      <header class="preflight-header">
        <h1 class="preflight-header-title" id="preflight-title">${HEADING}</h1>
      </header>

      <!-- Mobile top-nav (< 900px) -->
      <nav class="preflight-top-nav" role="tablist" aria-labelledby="preflight-title">
        <div class="preflight-top-nav-inner">
          ${tabs.value.map((tab, idx) => html`<${TopNavButton} tab=${tab} idx=${idx} />`)}
        </div>
      </nav>

      <div class="preflight-body">
        <!-- Desktop rail (≥ 900px) -->
        <nav class="preflight-nav-rail" role="tablist" aria-labelledby="preflight-title">
          ${tabs.value.map((tab, idx) => html`<${RailButton} tab=${tab} idx=${idx} />`)}
        </nav>

        <!-- Content area -->
        <div class="preflight-content-area">
          ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
        </div>
      </div>
    </div>`;
}

function preloadAssets(el) {
  return new Promise((resolve) => {
    const { miloLibs, codeRoot } = getConfig();
    const base = miloLibs || codeRoot;
    const bg = createTag('img', { src: `${base}${IMG_PATH}/preflight-bg.png` });
    const pic = createTag('picture', { class: 'bg-img' }, bg);
    bg.addEventListener('load', () => {
      resolve(pic);
      // Lazily load other images
      const check = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/check.svg` });
      const expand = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/expand.svg` });
      document.head.append(check, expand);
    });
    bg.addEventListener('error', () => resolve(null));
  });
}

// ── Clean up back-to-preflight popover if present ─────────────────────
function cleanupBackPopover() {
  const existing = document.querySelector('.preflight-back-popover');
  if (existing) existing.remove();
}

export default async function init(el) {
  isPreflightOpen = true;
  suppressNotification();
  cleanupBackPopover();

  // Attempt background preload but don't block render
  preloadAssets(el).catch(() => {});

  render(html`<${Preflight} />`, el);

  // Restore notification when the modal is closed
  const observer = new MutationObserver(() => {
    if (!document.contains(el) || el.closest('[aria-hidden="true"]')) {
      isPreflightOpen = false;
      restoreNotification();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden'] });
}
