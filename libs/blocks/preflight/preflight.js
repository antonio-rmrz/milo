import { html, render, signal } from '../../deps/htm-preact.js';
import General, { badge as generalBadge } from './panels/general.js';
import SEO, { badge as seoBadge } from './panels/seo.js';
import Accessibility, { badge as accessibilityBadge } from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch, { badge as merchBadge } from './panels/merch.js';
import Performance, { badge as performanceBadge } from './panels/performance.js';
import Assets, { badge as assetsBadge } from './panels/assets.js';

const HEADING = 'Milo Preflight';

const tabs = signal([
  { title: 'General', selected: true },
  { title: 'SEO' },
  { title: 'Martech' },
  { title: 'M@S' },
  { title: 'Accessibility' },
  { title: 'Performance' },
  { title: 'Assets' },
]);

/* Martech runs no checks, so it has no badge. */
const badges = {
  General: generalBadge,
  SEO: seoBadge,
  'M@S': merchBadge,
  Accessibility: accessibilityBadge,
  Performance: performanceBadge,
  Assets: assetsBadge,
};

const ICON_PATHS = {
  General: 'M5 2.75h6.25L15.25 6.5v10.75H5zM11.25 2.75V6.5h4M7.75 10h4.5M7.75 13h4.5',
  SEO: 'M9 15.5a6.25 6.25 0 1 0 0-12.5 6.25 6.25 0 0 0 0 12.5M13.5 13.5l3.75 3.75',
  Martech: 'M3.25 16.75h13.5M6 14.25v-4.5m4 4.5v-9m4 9v-6.5',
  'M@S': 'M2.75 2.75h6.1l8.4 8.4-6.1 6.1-8.4-8.4zM6.25 6.25h.01',
  Accessibility: 'M10 4.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M4.75 7.25c3.5 1 6.9 1 10.5 0M10 7.5v4.75m0 0-2.25 5m2.25-5 2.25 5',
  Performance: 'M11.25 2.5 4.75 11h4.5l-.5 6.5 6.5-8.5h-4.5z',
  Assets: 'M3.25 4.25h13.5v11.5H3.25zM3.25 12.75l4-4 3.5 3.5 2.25-2 3.75 3.75M12.75 7.5h.01',
};

function TabIcon({ title }) {
  const path = ICON_PATHS[title];
  if (!path) return null;
  return html`
    <svg class=preflight-tab-icon viewBox="0 0 20 20" width="20" height="20"
      fill="none" stroke="currentColor" stroke-width="1.4"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden=true focusable=false>
      <path d=${path} />
    </svg>`;
}

function TabBadge({ title }) {
  const counts = badges[title]?.value;
  if (!counts) return null;

  const { errors, warnings } = counts;
  const count = errors || warnings;
  if (!count) return null;

  const kind = errors ? 'error' : 'warning';
  const noun = `${kind}${count === 1 ? '' : 's'}`;
  return html`
    <span class="preflight-tab-badge is-${kind}" aria-label="${count} ${noun}">${count}</span>`;
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

function TabButton(props) {
  const id = `tab-${props.idx + 1}`;
  const controls = `panel-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  return html`
    <button
      id=${id}
      class=preflight-tab-button
      key=${props.tab.title}
      role="tab"
      aria-controls=${controls}
      aria-selected=${selected}
      onClick=${() => setTab(props.tab)}>
      <${TabIcon} title=${props.tab.title} />
      <span class=preflight-tab-label>${props.tab.title}</span>
      <${TabBadge} title=${props.tab.title} />
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
  const active = tabs.value.find((tab) => tab.selected);
  return html`
    <div class=preflight-shell>
      <nav class=preflight-rail>
        <p id=preflight-title>${HEADING}</p>
        <div class=preflight-tab-button-group role="tablist"
          aria-orientation="vertical" aria-labelledby=preflight-title>
          ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
        </div>
      </nav>
      <div class=preflight-main>
        <header class=preflight-panel-header>
          <h2 class=preflight-panel-title>${active?.title}</h2>
        </header>
        <div class=preflight-content>
          ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
        </div>
      </div>
    </div>
  `;
}

export default async function init(el) {
  document.querySelector('.milo-preflight-overlay')?.remove();
  render(html`<${Preflight} />`, el);
}
