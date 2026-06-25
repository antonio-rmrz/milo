/**
 * Preflight left nav rail.
 * Builds the <ul> with icon slots, labels, and per-tab issue badges.
 * Badge counts are derived from check result aggregates.
 */

/** SVG icons keyed by tab id */
const ICONS = {
  general: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M9 8v5M9 6h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  performance: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 13l4-5 3 3 4-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  assets: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M2 12l4-4 3 3 2-2 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  martech: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9 2v14M2 9h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  localization: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M9 1.5C9 1.5 6 5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 5 12 9s-3 7.5-3 7.5M1.5 9h15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
};

/**
 * @typedef {Object} TabDef
 * @property {string} id
 * @property {string} label
 */

/**
 * Builds the rail <nav> element.
 * @param {TabDef[]} tabs
 * @param {string}   activeId
 * @param {Function} onSelect  Called with (tabId) when a rail item is clicked.
 * @returns {HTMLElement}
 */
export function buildRail(tabs, activeId, onSelect) {
  const rail = document.createElement('nav');
  rail.className = 'preflight-rail';
  rail.setAttribute('aria-label', 'Preflight sections');

  const header = document.createElement('div');
  header.className = 'preflight-rail-header';
  header.textContent = 'Preflight';
  rail.appendChild(header);

  const ul = document.createElement('ul');
  ul.className = 'preflight-rail-nav';
  ul.setAttribute('role', 'tablist');

  tabs.forEach((tab) => {
    const li = document.createElement('li');
    li.className = 'preflight-rail-item';
    li.setAttribute('role', 'tab');
    li.setAttribute('aria-selected', tab.id === activeId ? 'true' : 'false');
    li.setAttribute('aria-controls', `preflight-panel-${tab.id}`);
    li.setAttribute('tabindex', tab.id === activeId ? '0' : '-1');
    li.dataset.tabId = tab.id;
    if (tab.id === activeId) li.classList.add('active');

    const iconWrap = document.createElement('span');
    iconWrap.className = 'preflight-rail-icon';
    iconWrap.innerHTML = ICONS[tab.id] || '';
    li.appendChild(iconWrap);

    const labelEl = document.createElement('span');
    labelEl.className = 'preflight-rail-label';
    labelEl.textContent = tab.label;
    li.appendChild(labelEl);

    const badge = document.createElement('span');
    badge.className = 'preflight-badge preflight-badge--error';
    badge.setAttribute('hidden', '');
    badge.dataset.railBadge = tab.id;
    li.appendChild(badge);

    li.addEventListener('click', () => onSelect(tab.id));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(tab.id);
      }
    });

    ul.appendChild(li);
  });

  rail.appendChild(ul);
  return rail;
}

/**
 * Updates the active state on all rail items.
 * @param {HTMLElement} rail
 * @param {string}      activeId
 */
export function setRailActive(rail, activeId) {
  rail.querySelectorAll('.preflight-rail-item').forEach((item) => {
    const isActive = item.dataset.tabId === activeId;
    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    item.setAttribute('tabindex', isActive ? '0' : '-1');
    item.classList.toggle('active', isActive);
  });
}

/**
 * Updates a badge on the rail for a given tab.
 * @param {HTMLElement} rail
 * @param {string}      tabId
 * @param {number}      errors
 * @param {number}      warnings
 */
export function updateRailBadge(rail, tabId, errors, warnings) {
  const badge = rail.querySelector(`[data-rail-badge="${tabId}"]`);
  if (!badge) return;
  const count = errors + warnings;
  if (count === 0) {
    badge.setAttribute('hidden', '');
    badge.textContent = '';
    return;
  }
  badge.removeAttribute('hidden');
  badge.textContent = String(count);
  badge.className = `preflight-badge preflight-badge--${errors > 0 ? 'error' : 'warning'}`;
}
