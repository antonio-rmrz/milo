import { html, render, signal } from '../../deps/htm-preact.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const HEADING = 'Milo Preflight';

const tabs = signal([
  { title: 'General', selected: true, errors: 0, warnings: 0 },
  { title: 'SEO', errors: 0, warnings: 0 },
  { title: 'Martech', errors: 0, warnings: 0 },
  { title: 'M@S', errors: 0, warnings: 0 },
  { title: 'Accessibility', errors: 0, warnings: 0 },
  { title: 'Performance', errors: 0, warnings: 0 },
  { title: 'Assets', errors: 0, warnings: 0 },
]);

export function setTabBadge(title, errors, warnings) {
  tabs.value = tabs.value.map((tab) => {
    if (tab.title !== title) return tab;
    return { ...tab, errors: errors || 0, warnings: warnings || 0 };
  });
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

/* Inline SVG icons for the nav rail */
// eslint-disable-next-line max-len
const SVG_GENERAL = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM8.25 5v5.25l4.5 2.7-.75 1.25-5.25-3.2V5h1.5z"/></svg>';
// eslint-disable-next-line max-len
const SVG_SEO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M11.5 2a5.5 5.5 0 0 1 4.33 8.895l2.387 2.386a.75.75 0 0 1-1.06 1.06l-2.387-2.386A5.5 5.5 0 1 1 11.5 2zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 8.25h4v1.5H3v-1.5zM3 5h2.5v1.5H3V5zm0 6.5h3.5V13H3v-1.5z"/></svg>';
// eslint-disable-next-line max-len
const SVG_MARTECH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M2 3.75C2 2.784 2.784 2 3.75 2h10.5C15.216 2 16 2.784 16 3.75v10.5A1.75 1.75 0 0 1 14.25 16H3.75A1.75 1.75 0 0 1 2 14.25V3.75zm1.5.25v10h11V4h-11zm2 2h7v1.5h-7V6zm0 3h7v1.5h-7V9zm0 3h4v1.5h-4V12z"/></svg>';
// eslint-disable-next-line max-len
const SVG_MAS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M9 1.5 1.5 5v8L9 16.5 16.5 13V5L9 1.5zm0 1.73 5.5 2.87v6.74L9 14.77 3.5 12.84V5.1L9 3.23zm0 2.27a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm0 1.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>';
// eslint-disable-next-line max-len
const SVG_A11Y = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><circle cx="9" cy="3" r="1.5"/><path d="M5.25 5.5a.75.75 0 0 0 0 1.5H7.5V9L5.1 14.4a.75.75 0 1 0 1.4.6L9 9.95l2.5 5.05a.75.75 0 0 0 1.4-.6L10.5 9V7h2.25a.75.75 0 0 0 0-1.5H5.25z"/></svg>';
// eslint-disable-next-line max-len
const SVG_PERF = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M9 2a7 7 0 1 0 0 14A7 7 0 0 0 9 2zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm.75 2V9.5l3.25 1.95-.75 1.25-3.75-2.25V5.5h1.25z"/></svg>';
// eslint-disable-next-line max-len
const SVG_ASSETS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M3.75 2A1.75 1.75 0 0 0 2 3.75v10.5C2 15.216 2.784 16 3.75 16h10.5A1.75 1.75 0 0 0 16 14.25V3.75A1.75 1.75 0 0 0 14.25 2H3.75zm0 1.5h10.5a.25.25 0 0 1 .25.25v6.69l-3-3-4 4-2-2-2 2V3.75a.25.25 0 0 1 .25-.25zM6 5a1.5 1.5 0 1 0 0 3A1.5 1.5 0 0 0 6 5zm-2.5 9 2.5-2.5 2 2 4-4 2.75 2.75H3.75a.25.25 0 0 1-.25-.25z"/></svg>';

const NAV_ICONS = {
  General: SVG_GENERAL,
  SEO: SVG_SEO,
  Martech: SVG_MARTECH,
  'M@S': SVG_MAS,
  Accessibility: SVG_A11Y,
  Performance: SVG_PERF,
  Assets: SVG_ASSETS,
};

function NavItem({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const iconSvg = NAV_ICONS[tab.title] || '';
  const hasBadge = tab.errors > 0 || tab.warnings > 0;
  const badgeClass = tab.errors > 0 ? 'badge-error' : 'badge-warning';
  const badgeCount = tab.errors > 0 ? tab.errors : tab.warnings;

  return html`
    <button
      id=${id}
      class="preflight-nav-item"
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <span
        class="preflight-nav-item-icon"
        dangerouslySetInnerHTML=${{ __html: iconSvg }}
      ></span>
      <span class="preflight-nav-item-label">${tab.title}</span>
      ${hasBadge && html`<span class="preflight-nav-badge ${badgeClass}">${badgeCount}</span>`}
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
  return html`
    <nav class="preflight-nav-rail" role="tablist" aria-label=${HEADING}>
      <p class="preflight-nav-rail-heading">${HEADING}</p>
      ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class="preflight-main-content">
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

export default async function init(el) {
  render(html`<${Preflight} />`, el);
  document.dispatchEvent(new CustomEvent('preflight:open'));

  const closeBtn = el.closest('.dialog-modal')?.querySelector('.dialog-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('preflight:close'));
    }, { once: true });
  }
}
