import { html, render, signal } from '../../deps/htm-preact.js';
import General, { localizationIssues } from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const HEADING = 'Milo Preflight';

/* Icons — inline SVG paths per tab (Spectrum-style stroked icons) */
const TAB_ICONS = {
  General: html`<svg class=preflight-tab-icon viewBox="0 0 24 24" aria-hidden=true><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  SEO: html`<svg class=preflight-tab-icon viewBox="0 0 24 24" aria-hidden=true><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>`,
  Martech: html`<svg class=preflight-tab-icon viewBox="0 0 24 24" aria-hidden=true><path d="M3 3h18v4H3zM3 10h12v4H3zM3 17h8v4H3z"/></svg>`,
  'M@S': html`<svg class=preflight-tab-icon viewBox="0 0 24 24" aria-hidden=true><path d="M6 2h12l3 6-9 13L3 8z"/></svg>`,
  Accessibility: html`<svg class=preflight-tab-icon viewBox="0 0 24 24" aria-hidden=true><circle cx="12" cy="5" r="2"/><path d="M12 8c-4 0-7 1.5-7 1.5l2 1.5s2-1 5-1 5 1 5 1l2-1.5S16 8 12 8z"/><path d="M8 11.5l-1.5 8h3L12 15l2.5 4.5h3L16 11.5"/></svg>`,
  Performance: html`<svg class=preflight-tab-icon viewBox="0 0 24 24" aria-hidden=true><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>`,
  Assets: html`<svg class=preflight-tab-icon viewBox="0 0 24 24" aria-hidden=true><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
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
    case 'General': return html`<${General} />`;
    case 'SEO': return html`<${SEO} />`;
    case 'Martech': return html`<${Martech} />`;
    case 'M@S': return html`<${Merch} />`;
    case 'Accessibility': return html`<${Accessibility} />`;
    case 'Performance': return html`<${Performance} />`;
    case 'Assets': return html`<${Assets} />`;
    default: return html`<p>No matching panel.</p>`;
  }
}

function TabButton(props) {
  const id = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  const issueCount = props.tab.title === 'General' ? localizationIssues.value.length : 0;
  return html`
    <button
      id=${id}
      class=preflight-tab-button
      key=${props.tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(props.tab)}>
      ${TAB_ICONS[props.tab.title] || null}
      <span class=preflight-tab-label>${props.tab.title}</span>
      ${issueCount > 0 && html`<span class=preflight-badge data-type="warning" aria-label="${issueCount} localization issues">${issueCount}</span>`}
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

function Preflight() {
  return html`
    <nav class=preflight-nav-rail role="tablist" aria-label=${HEADING}>
      ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class=preflight-content-area>
      <div class=preflight-content>
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

/* Suppress / restore the preflight notification overlay while modal is open */
let suppressedNotification = null;

function suppressNotification() {
  const overlay = document.querySelector('.milo-preflight-overlay');
  if (overlay && overlay.style.display !== 'none') {
    suppressedNotification = overlay;
    overlay.style.display = 'none';
  }
}

function restoreNotification() {
  if (suppressedNotification) {
    suppressedNotification.style.display = '';
    suppressedNotification = null;
  }
}

export default async function init(el) {
  suppressNotification();

  /* Listen for modal close to restore the notification */
  el.addEventListener('closeModal', restoreNotification, { once: true });
  document.addEventListener('modal:closed', restoreNotification, { once: true });

  render(html`<${Preflight} />`, el);
}
