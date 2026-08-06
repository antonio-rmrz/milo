import { html, render, signal } from '../../deps/htm-preact.js';
import { createTag, getConfig } from '../../utils/utils.js';
import General, { generalBadge } from './panels/general.js';
import SEO, { seoBadge } from './panels/seo.js';
import Accessibility, { accessibilityBadge } from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch, { merchBadge } from './panels/merch.js';
import Performance, { performanceBadge } from './panels/performance.js';
import Assets, { assetsBadge } from './panels/assets.js';

const HEADING = 'Milo Preflight';
const IMG_PATH = '/blocks/preflight/img';

const NAV_ICONS = {
  General: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3.5 2.5h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.3"/><path d="M6 6.5h6M6 9h6M6 11.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  SEO: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="7.75" cy="7.75" r="4.75" stroke="currentColor" stroke-width="1.3"/><path d="M11.5 11.5 15.5 15.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  Martech: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2.5 4.5h13v9h-13z" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 7.5h13M6 4.5v9" stroke="currentColor" stroke-width="1.3"/></svg>',
  'M@S': '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 6.5h10l-1 8H5l-1-8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M6.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" stroke-width="1.3"/></svg>',
  Accessibility: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><circle cx="9" cy="6" r="1.15" fill="currentColor"/><path d="M4.8 8.4c1.4.6 2.8.9 4.2.9s2.8-.3 4.2-.9M9 9.3v5.1M6.7 15.6 9 12.4l2.3 3.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Performance: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 13.5a6 6 0 1 1 12 0" stroke="currentColor" stroke-width="1.3"/><path d="M9 13.5 12 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="9" cy="13.5" r="1" fill="currentColor"/></svg>',
  Assets: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2.75 3.75h12.5v10.5H2.75z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="6.25" cy="7.25" r="1.25" stroke="currentColor" stroke-width="1.3"/><path d="M3.25 12.75 7 9l2.25 2.25L12 8.5l2.75 2.75" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
};

const BADGE_SIGNALS = {
  General: generalBadge,
  SEO: seoBadge,
  Martech: null,
  'M@S': merchBadge,
  Accessibility: accessibilityBadge,
  Performance: performanceBadge,
  Assets: assetsBadge,
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

function NavBadge({ title }) {
  const badgeSignal = BADGE_SIGNALS[title];
  if (!badgeSignal) return null;
  const { errors, warnings } = badgeSignal.value;
  if (!errors && !warnings) return null;
  return html`
    <span class="preflight-nav-badges">
      ${!!errors && html`<span class="preflight-nav-badge is-error">${errors}</span>`}
      ${!!warnings && html`<span class="preflight-nav-badge is-warning">${warnings}</span>`}
    </span>`;
}

function TabButton(props) {
  const id = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  return html`
    <button
      id=${id}
      class=preflight-tab-button
      key=${props.tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(props.tab)}>
      <span class="preflight-nav-icon" dangerouslySetInnerHTML=${{ __html: NAV_ICONS[props.tab.title] }}></span>
      <span class="preflight-nav-label">${props.tab.title}</span>
      <${NavBadge} title=${props.tab.title} />
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
      <p class="preflight-panel-header">${props.tab.title}</p>
      ${setPanel(props.tab.title)}
    </div>`;
}

function Preflight() {
  return html`
    <div class=preflight-heading>
      <p id=preflight-title>${HEADING}</p>
    </div>
    <div class=preflight-body>
      <div class=preflight-tab-button-group role="tablist" aria-labelledby=preflight-title>
        ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
      </div>
      <div class=preflight-content>
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

function preloadAssets() {
  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs || codeRoot;
  const check = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/check.svg` });
  const expand = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/expand.svg` });
  document.head.append(check, expand);
}

export default async function init(el) {
  preloadAssets();
  render(html`<${Preflight} />`, el);
}
