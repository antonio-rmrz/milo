import { html, render, signal } from '../../deps/htm-preact.js';
import General, { getBadgeCounts as getGeneralBadgeCounts } from './panels/general.js';
import SEO, { getBadgeCounts as getSeoBadgeCounts } from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch, { getBadgeCounts as getMerchBadgeCounts } from './panels/merch.js';
import Performance, { getBadgeCounts as getPerformanceBadgeCounts } from './panels/performance.js';
import Assets, { getBadgeCounts as getAssetsBadgeCounts } from './panels/assets.js';

const HEADING = 'Milo Preflight';
const NOTIFICATION_SELECTOR = '.milo-preflight-overlay';
const NOTIFICATION_HIDDEN_CLASS = 'preflight-notification-hidden';

const TAB_ICONS = {
  General: 'general',
  SEO: 'seo',
  Martech: 'martech',
  'M@S': 'merch',
  Accessibility: 'accessibility',
  Performance: 'performance',
  Assets: 'assets',
};

const TAB_DESCRIPTIONS = {
  General: 'Page structure, localization, and publish status for this page and its content.',
  SEO: 'Search readiness checks for title, description, headings, links, and body copy.',
  Martech: 'Trackable page strings for analytics tagging, ready to copy.',
  'M@S': 'Merch-at-Scale fragments, offers, and checkout link health.',
  Accessibility: 'Automated WCAG checks and image alt-text audit.',
  Performance: 'LCP readiness and asset loading best practices.',
  Assets: 'Image and video dimensions compared against their display size.',
};

const BADGE_SOURCES = {
  General: getGeneralBadgeCounts,
  SEO: getSeoBadgeCounts,
  'M@S': getMerchBadgeCounts,
  Performance: getPerformanceBadgeCounts,
  Assets: getAssetsBadgeCounts,
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

function getBadge(title) {
  const counts = BADGE_SOURCES[title]?.();
  if (!counts) return null;
  const { errors = 0, warnings = 0 } = counts;
  if (errors > 0) return { style: 'error', count: errors, label: `${errors} error${errors === 1 ? '' : 's'}` };
  if (warnings > 0) return { style: 'warning', count: warnings, label: `${warnings} warning${warnings === 1 ? '' : 's'}` };
  return null;
}

function TabButton(props) {
  const id = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  const badge = getBadge(props.tab.title);
  return html`
    <button
      id=${id}
      class=preflight-tab-button
      key=${props.tab.title}
      role=tab
      aria-controls=${`panel-${props.idx + 1}`}
      aria-selected=${selected}
      aria-current=${selected ? 'page' : undefined}
      onClick=${() => setTab(props.tab)}>
      <span class="preflight-nav-icon preflight-nav-icon-${TAB_ICONS[props.tab.title]}" aria-hidden=true></span>
      <span class=preflight-nav-label>${props.tab.title}</span>
      ${badge && html`<span class="preflight-badge preflight-badge-${badge.style}" aria-label=${badge.label}>${badge.count}</span>`}
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
  const activeTab = tabs.value.find((tab) => tab.selected) || tabs.value[0];
  return html`
    <div class=preflight-shell>
      <nav class=preflight-nav-rail aria-label="Preflight sections">
        <p id=preflight-title>${HEADING}</p>
        <div class=preflight-tab-button-group role="tablist" aria-labelledby=preflight-title>
          ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
        </div>
      </nav>
      <section class=preflight-main>
        <header class=preflight-section-header>
          <h2 class=preflight-section-title>${activeTab.title}</h2>
          <p class=preflight-section-description>${TAB_DESCRIPTIONS[activeTab.title]}</p>
        </header>
        <div class=preflight-content>
          ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
        </div>
      </section>
    </div>
  `;
}

function suppressNotifications() {
  document.querySelectorAll(NOTIFICATION_SELECTOR)
    .forEach((notification) => notification.classList.add(NOTIFICATION_HIDDEN_CLASS));
}

function restoreNotifications() {
  document.querySelectorAll(`${NOTIFICATION_SELECTOR}.${NOTIFICATION_HIDDEN_CLASS}`)
    .forEach((notification) => notification.classList.remove(NOTIFICATION_HIDDEN_CLASS));
}

/**
 * Dismisses the page-level preflight notification while the modal is open and
 * restores it once the modal closes. The block is rendered before the modal
 * dialog is attached, so the observer waits for the element to connect and
 * treats its later disconnection as "modal closed".
 */
function watchNotifications(el) {
  suppressNotifications();
  let wasConnected = el.isConnected;
  const observer = new MutationObserver(() => {
    if (!wasConnected) {
      wasConnected = el.isConnected;
    } else if (!el.isConnected) {
      observer.disconnect();
      restoreNotifications();
      return;
    }
    suppressNotifications();
  });
  observer.observe(document.body, { childList: true });
}

export default async function init(el) {
  render(html`<${Preflight} />`, el);
  watchNotifications(el);
}
