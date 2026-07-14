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

const tabs = signal([
  { title: 'General', selected: true, errors: 0, warnings: 0 },
  { title: 'SEO', errors: 0, warnings: 0 },
  { title: 'Martech', errors: 0, warnings: 0 },
  { title: 'M@S', errors: 0, warnings: 0 },
  { title: 'Accessibility', errors: 0, warnings: 0 },
  { title: 'Performance', errors: 0, warnings: 0 },
  { title: 'Assets', errors: 0, warnings: 0 },
]);

export function setTabIssues(title, { errors = 0, warnings = 0 } = {}) {
  tabs.value = tabs.value.map((tab) => {
    if (tab.title !== title) return tab;
    return { ...tab, errors, warnings };
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

const TAB_ICONS = {
  General: `${IMG_PATH}/nav-general.svg`,
  SEO: `${IMG_PATH}/nav-seo.svg`,
  Martech: `${IMG_PATH}/nav-martech.svg`,
  'M@S': `${IMG_PATH}/nav-mas.svg`,
  Accessibility: `${IMG_PATH}/nav-accessibility.svg`,
  Performance: `${IMG_PATH}/nav-performance.svg`,
  Assets: `${IMG_PATH}/nav-assets.svg`,
};

function NavItem({ tab, idx, base }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const hasBadge = tab.errors > 0 || tab.warnings > 0;
  const badgeClass = tab.errors > 0 ? 'preflight-nav-badge preflight-nav-badge--error' : 'preflight-nav-badge preflight-nav-badge--warning';
  const badgeCount = tab.errors > 0 ? tab.errors : tab.warnings;
  const iconSrc = `${base}${TAB_ICONS[tab.title]}`;

  return html`
    <button
      id=${id}
      class="preflight-nav-item${selected ? ' active' : ''}"
      key=${tab.title}
      role="tab"
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <img class="preflight-nav-icon" src=${iconSrc} alt="" aria-hidden="true" />
      <span class="preflight-nav-label">${tab.title}</span>
      ${hasBadge && html`<span class=${badgeClass} aria-label="${badgeCount} issue${badgeCount !== 1 ? 's' : ''}">${badgeCount}</span>`}
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

function Preflight({ base }) {
  const activeTab = tabs.value.find((t) => t.selected);
  return html`
    <nav class="preflight-nav-rail" role="tablist" aria-label="Preflight sections">
      <p class="preflight-nav-heading">${HEADING}</p>
      ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} base=${base} />`)}
    </nav>
    <div class="preflight-main">
      ${activeTab && html`<p class="preflight-content-header">${activeTab.title}</p>`}
      <div class="preflight-content">
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

let suppressedNotification = null;

function suppressNotification() {
  const notif = document.querySelector('.milo-notification, .floating-cta, [class*="notification"]');
  if (!notif) return;
  suppressedNotification = notif;
  notif.classList.add('preflight-notif-suppressed');
}

function restoreNotification() {
  if (!suppressedNotification) return;
  suppressedNotification.classList.remove('preflight-notif-suppressed');
  suppressedNotification = null;
}

function preloadAssets(el) {
  return new Promise((resolve) => {
    const { miloLibs, codeRoot } = getConfig();
    const base = miloLibs || codeRoot;
    const bg = createTag('img', { src: `${base}${IMG_PATH}/preflight-bg.png` });
    const pic = createTag('picture', { class: 'bg-img' }, bg);
    bg.addEventListener('load', () => {
      resolve({ pic, base });
      el.insertAdjacentElement('afterbegin', pic);

      // Lazily load other images
      const check = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/check.svg` });
      const expand = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/expand.svg` });
      document.head.append(check, expand);
    });
    bg.addEventListener('error', () => resolve({ pic: null, base }));
  });
}

export default async function init(el) {
  const { base } = await preloadAssets(el);
  const { miloLibs, codeRoot } = getConfig();
  const resolvedBase = base || miloLibs || codeRoot;

  suppressNotification();

  el.addEventListener('dialog-closed', () => {
    restoreNotification();
  }, { once: false });

  render(html`<${Preflight} base=${resolvedBase} />`, el);
}
