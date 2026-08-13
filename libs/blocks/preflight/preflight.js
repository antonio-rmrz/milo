import { html, render, signal, useEffect } from '../../deps/htm-preact.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';
import { getPreflightResults } from './checks/preflightApi.js';
import { TABS_CONFIG, computeBadges } from './preflight-utils.js';

export { computeBadges };

const HEADING = 'Milo Preflight';

const tabs = signal(TABS_CONFIG.map((tab, idx) => ({ ...tab, selected: idx === 0 })));

const badgeCounts = signal({});

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

const TAB_ICONS = {
  General: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="10" y="1" width="5" height="5" rx="1"/><rect x="1" y="10" width="5" height="5" rx="1"/><rect x="10" y="10" width="5" height="5" rx="1"/></svg>`,
  SEO: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10" y1="10" x2="14.5" y2="14.5"/></svg>`,
  Martech: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5,3 2,3 2,14 14,14 14,11"/><polyline points="9,2 14,2 14,7"/><line x1="14" y1="2" x2="8" y2="8"/></svg>`,
  'M@S': html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2h12l-1.5 6H3.5L2 2z"/><path d="M3.5 8v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8"/></svg>`,
  Accessibility: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="3" r="1.5"/><path d="M4 6.5h8L10.5 11l-.5 4H6l-.5-4L4 6.5z"/></svg>`,
  Performance: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2 11a6 6 0 1 1 12 0"/><line x1="8" y1="11" x2="11.5" y2="6.5"/></svg>`,
  Assets: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="14" height="10" rx="1"/><circle cx="5.5" cy="7" r="1.5"/><polyline points="1,11 5,7.5 8,10 11,7 15,11"/></svg>`,
};

function NavBadge({ type }) {
  if (!type) return null;
  const cls = `preflight-badge preflight-badge-${type}`;
  return html`<span class=${cls} aria-label="${type === 'error' ? 'has errors' : 'has warnings'}"></span>`;
}

function NavButton({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const badge = badgeCounts.value[tab.title];

  return html`
    <button
      id=${id}
      class="preflight-nav-button${selected ? ' is-selected' : ''}"
      role="tab"
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <span class="preflight-nav-icon">${TAB_ICONS[tab.title]}</span>
      <span class="preflight-nav-label">${tab.title}</span>
      <${NavBadge} type=${badge} />
    </button>`;
}

function TabPanel(props) {
  const id = `panel-${props.idx + 1}`;
  const labeledBy = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;

  return html`
    <div
      id=${id}
      class=preflight-tab-panel
      aria-labelledby=${labeledBy}
      key=${props.tab.title}
      aria-selected=${selected}
      role="tabpanel">
      ${setPanel(props.tab.title)}
    </div>`;
}

export function Preflight() {
  useEffect(() => {
    // Dismiss notification while preflight is open
    if (window.dismissPreflightNotification) {
      window.dismissPreflightNotification();
    } else {
      document.querySelector('.milo-preflight-overlay')?.remove();
    }

    // Compute per-tab badges in the background
    getPreflightResults({ url: window.location.href, area: document, useCache: true })
      .then((results) => {
        if (results) badgeCounts.value = computeBadges(results);
      })
      .catch(() => {});
  }, []);

  return html`
    <div class=preflight-header>
      <p id=preflight-title>${HEADING}</p>
    </div>
    <div class=preflight-body>
      <nav class="preflight-nav-rail" role="tablist" aria-labelledby="preflight-title">
        ${tabs.value.map((tab, idx) => html`<${NavButton} tab=${tab} idx=${idx} />`)}
      </nav>
      <div class=preflight-content>
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

export default async function init(el) {
  window.addEventListener('preflight:close', () => {
    document.querySelector('.dialog-modal#preflight .dialog-close')?.click();
  });
  render(html`<${Preflight} />`, el);
}
