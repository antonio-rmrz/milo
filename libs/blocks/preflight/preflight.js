import { html, render, signal } from '../../deps/htm-preact.js';
import { createTag, getConfig } from '../../utils/utils.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';
import { badgeCounts } from './preflight-badges.js';

const IMG_PATH = '/blocks/preflight/img';

/* SVG icons for nav rail — simple inline shapes, one per tab */
const NAV_ICONS = {
  General: `<svg class="preflight-nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M5 6h8M5 9h8M5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  SEO: `<svg class="preflight-nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M12 12l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  Martech: `<svg class="preflight-nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3 14l4-5 3 3 3-4 3 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'M@S': `<svg class="preflight-nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M9 2l2.09 4.26L16 7.27l-3.5 3.41.83 4.82L9 13.25l-4.33 2.25.83-4.82L2 7.27l4.91-.71L9 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  Accessibility: `<svg class="preflight-nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="4" r="1.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M4 7h10M9 7v5M7 16l2-4 2 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  Performance: `<svg class="preflight-nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M2 12a7 7 0 1114 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M9 12L7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="9" cy="12" r="1" fill="currentColor"/>
  </svg>`,
  Assets: `<svg class="preflight-nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="6.5" cy="8" r="1.5" stroke="currentColor" stroke-width="1.2"/>
    <path d="M2 12l3.5-3 3 2.5 2.5-2 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
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
  tabs.value = tabs.value.map((tab) => ({
    ...tab,
    selected: tab.title === active.title,
  }));
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

function NavBadge({ count, type }) {
  if (!count || count <= 0) return null;
  return html`<span class="preflight-nav-badge badge-${type}">${count}</span>`;
}

function NavItem({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const counts = badgeCounts.value[tab.title] || { errors: 0, warnings: 0 };
  const iconSvg = NAV_ICONS[tab.title] || '';

  return html`
    <button
      id=${id}
      class="preflight-nav-item"
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <span dangerouslySetInnerHTML=${{ __html: iconSvg }}></span>
      <span class="preflight-nav-label">${tab.title}</span>
      ${counts.errors > 0 && html`<${NavBadge} count=${counts.errors} type="error" />`}
      ${counts.errors <= 0 && counts.warnings > 0 && html`<${NavBadge} count=${counts.warnings} type="warning" />`}
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
    <div class="preflight-c2">
      <nav class="preflight-nav-rail" role="tablist" aria-label="Preflight sections">
        <p class="preflight-nav-heading">Preflight</p>
        ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} />`)}
      </nav>
      <div class="preflight-content">
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

function suppressNotifications() {
  document.querySelectorAll('.preflight-notification, .notification').forEach((n) => {
    n.dataset.preflightHidden = 'true';
    n.style.setProperty('display', 'none', 'important');
  });
  document.body.classList.add('preflight-open');
}

function restoreNotifications() {
  document.querySelectorAll('[data-preflight-hidden="true"]').forEach((n) => {
    n.removeAttribute('data-preflight-hidden');
    n.style.removeProperty('display');
  });
  document.body.classList.remove('preflight-open');
}

function preloadAssets(el) {
  return new Promise((resolve) => {
    const { miloLibs, codeRoot } = getConfig();
    const base = miloLibs || codeRoot;
    const bg = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/check.svg` });
    const expand = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/expand.svg` });
    document.head.append(bg, expand);
    resolve(el);
  });
}

export default async function init(el) {
  await preloadAssets(el);
  suppressNotifications();

  const dialog = el.closest('.dialog-modal');
  if (dialog) {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(dialog) || dialog.getAttribute('aria-hidden') === 'true') {
        restoreNotifications();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden'] });
  }

  render(html`<${Preflight} />`, el);

  // Add lcp tooltip container to document body if not present
  if (!document.querySelector('.lcp-tooltip-modal')) {
    document.body.appendChild(createTag('div', { class: 'lcp-tooltip-modal' }));
  }
}
