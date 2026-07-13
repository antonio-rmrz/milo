import { html, render, signal } from '../../deps/htm-preact.js';
import { getConfig } from '../../utils/utils.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';
import { badgeCounts } from './badge-counts.js';

const HEADING = 'Preflight';
const IMG_PATH = '/blocks/preflight/img';

/* SVG icons for each nav-rail section */
const TAB_ICONS = {
  General: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
  SEO: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  Martech: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  'M@S': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  Accessibility: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="4" r="2"/><path d="M12 12v8M12 12l-4-4M12 12l4-4M8 20l-2-4 2-4M16 20l2-4-2-4"/></svg>',
  Performance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  Assets: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
};

const tabs = signal([
  { title: 'General', selected: true },
  { title: 'SEO' },
  { title: 'Martech' },
  { title: 'M@S' },
  { title: 'Accessibility' },
  { title: 'Performance' },
  { title: 'Assets' },
]);

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

function NavBadge({ errors, warnings }) {
  if (errors > 0) {
    return html`<span class="preflight-nav-badge preflight-nav-badge-error" aria-label="${errors} error${errors !== 1 ? 's' : ''}">${errors}</span>`;
  }
  if (warnings > 0) {
    return html`<span class="preflight-nav-badge preflight-nav-badge-warning" aria-label="${warnings} warning${warnings !== 1 ? 's' : ''}">${warnings}</span>`;
  }
  return null;
}

function NavItem({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.title === tabs.value.find((t) => t.selected)?.title;
  const counts = badgeCounts.value[tab.title] || { errors: 0, warnings: 0 };

  return html`
    <button
      id=${id}
      class="preflight-nav-item${selected ? ' is-active' : ''}"
      aria-selected=${selected}
      role="tab"
      onClick=${() => setTab(tab)}>
      <span class="preflight-nav-icon" dangerouslySetInnerHTML=${{ __html: TAB_ICONS[tab.title] || '' }}></span>
      <span class="preflight-nav-label">${tab.title}</span>
      <${NavBadge} errors=${counts.errors} warnings=${counts.warnings} />
    </button>`;
}

function TabPanel({ tab, idx }) {
  const id = `panel-${idx + 1}`;
  const labeledBy = `tab-${idx + 1}`;
  const selected = tab.selected === true;

  return html`
    <div
      id=${id}
      class="preflight-tab-panel"
      aria-labelledby=${labeledBy}
      key=${tab.title}
      aria-selected=${selected}
      role="tabpanel">
      ${setPanel(tab.title)}
    </div>`;
}

function Preflight() {
  const activeTitle = tabs.value.find((t) => t.selected)?.title || 'Preflight';
  return html`
    <nav class="preflight-nav" role="tablist" aria-label="Preflight sections">
      <p class="preflight-nav-heading">${HEADING}</p>
      ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class="preflight-main">
      <p class="preflight-section-title">${activeTitle}</p>
      <div class="preflight-panels">
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

/* Notification suppression while modal is open */
function suppressNotification() {
  const overlay = document.querySelector('.milo-preflight-overlay');
  if (overlay) {
    overlay.dataset.preflightHidden = 'true';
    overlay.style.display = 'none';
  }
}

function restoreNotification() {
  const overlay = document.querySelector('.milo-preflight-overlay[data-preflight-hidden]');
  if (overlay) {
    delete overlay.dataset.preflightHidden;
    overlay.style.display = '';
  }
}

/* Re-open after Back-to-Preflight navigation */
function checkBackReopen(el) {
  try {
    const stored = sessionStorage.getItem('preflight-back');
    if (!stored) return;
    sessionStorage.removeItem('preflight-back');
    const data = JSON.parse(stored);
    if (data.reopen && Date.now() - data.ts < 60000) {
      const dialog = el.closest('dialog') || el.closest('.dialog-modal');
      dialog?.showModal?.();
    }
  } catch {
    /* ignore */
  }
}

export default async function init(el) {
  /* Preload background image to avoid layout shift */
  await new Promise((resolve) => {
    const { miloLibs, codeRoot } = getConfig();
    const base = miloLibs || codeRoot;
    const bg = document.createElement('img');
    bg.src = `${base}${IMG_PATH}/preflight-bg.png`;
    bg.className = 'bg-img-preflight';
    bg.addEventListener('load', resolve, { once: true });
    bg.addEventListener('error', resolve, { once: true });
    el.insertAdjacentElement('afterbegin', bg);
  });

  render(html`<${Preflight} />`, el);

  suppressNotification();
  el.dispatchEvent(new CustomEvent('preflight:open', { bubbles: true }));

  /* Restore notification when dialog closes */
  const dialog = el.closest('dialog') || el.closest('.dialog-modal');
  if (dialog) {
    dialog.addEventListener('close', () => {
      restoreNotification();
      el.dispatchEvent(new CustomEvent('preflight:close', { bubbles: true }));
    }, { once: true });
  }

  checkBackReopen(el);
}
