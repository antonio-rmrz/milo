/**
 * Preflight Modal — Light Theme on Spectrum-2 (c2) Tokens
 *
 * Entry point.  Call init() to mount the modal trigger and overlay.
 * Accessible via ?milolibs=preflight-redesign-light-theme on a branch deploy.
 */

import { buildRail, setRailActive, updateRailBadge } from './rail.js';
import { createStatusChip } from './components/status-chip.js';
import { createProgressRing } from './components/progress-ring.js';
import { runGeneralChecks, countFaultyLinks } from './checks/general.js';
import { detectLcpElement, buildPerformanceContent } from './checks/performance.js';
import { buildAssetsContent } from './checks/assets.js';
import { buildMartechContent } from './checks/martech.js';
import { buildLocalizationContent, runLocalizationChecks } from './checks/localization.js';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'performance', label: 'Performance' },
  { id: 'assets', label: 'Assets' },
  { id: 'martech', label: 'Martech' },
  { id: 'localization', label: 'Localization' },
];

let modalEl = null;
let overlayEl = null;
let railEl = null;
let activeTabId = 'general';

// ── Notification suppression ──────────────────────────────────────────────
function suppressNotifications() {
  document.body.setAttribute('data-preflight-open', 'true');
}

function restoreNotifications() {
  document.body.removeAttribute('data-preflight-open');
}

// ── Tab switching ─────────────────────────────────────────────────────────
function switchTab(tabId) {
  if (!modalEl) return;
  activeTabId = tabId;
  setRailActive(railEl, tabId);
  modalEl.querySelectorAll('.preflight-tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.tabId === tabId);
  });
  // Update content-header title
  const titleEl = modalEl.querySelector('.preflight-content-title');
  if (titleEl) {
    const tab = TABS.find((t) => t.id === tabId);
    if (tab) titleEl.textContent = tab.label;
  }
}

// ── Badge aggregation ─────────────────────────────────────────────────────
function updateBadges() {
  if (!railEl) return;

  // General: metadata errors + localization faulty links
  const generalResults = runGeneralChecks();
  const generalErrors = generalResults.filter((r) => r.status === 'error').length;
  const generalWarnings = generalResults.filter((r) => r.status === 'warning').length;
  const faultyLinks = countFaultyLinks();
  updateRailBadge(railEl, 'general', generalErrors + faultyLinks.errors, generalWarnings + faultyLinks.warnings);

  // Localization
  const locIssues = runLocalizationChecks();
  const locErrors = locIssues.filter((i) => i.severity === 'error').length;
  const locWarnings = locIssues.filter((i) => i.severity === 'warning').length;
  updateRailBadge(railEl, 'localization', locErrors, locWarnings);
}

// ── Panel builders ────────────────────────────────────────────────────────
function buildGeneralPanel() {
  const panel = document.createElement('div');
  panel.className = 'preflight-tab-panel';
  panel.dataset.tabId = 'general';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', 'preflight-panel-general');
  panel.setAttribute('aria-labelledby', 'preflight-tab-general');

  const card = document.createElement('div');
  card.className = 'preflight-card';

  const header = document.createElement('div');
  header.className = 'preflight-card-header';
  const title = document.createElement('h3');
  title.className = 'preflight-card-title';
  title.textContent = 'Page Metadata';
  header.appendChild(title);
  card.appendChild(header);

  const results = runGeneralChecks();
  results.forEach((result) => {
    const row = document.createElement('div');
    row.className = 'preflight-check-row';

    const labelWrap = document.createElement('div');
    labelWrap.className = 'preflight-check-row-label';
    labelWrap.textContent = result.label;

    const chip = createStatusChip(result.status, result.status);
    const detail = document.createElement('div');
    detail.className = 'preflight-check-row-detail';
    detail.textContent = result.detail;

    row.appendChild(labelWrap);
    row.appendChild(chip);
    labelWrap.appendChild(detail);
    card.appendChild(row);
  });

  panel.appendChild(card);
  return panel;
}

function buildPerformancePanel() {
  const panel = document.createElement('div');
  panel.className = 'preflight-tab-panel';
  panel.dataset.tabId = 'performance';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', 'preflight-panel-performance');
  panel.setAttribute('aria-labelledby', 'preflight-tab-performance');

  const card = document.createElement('div');
  card.className = 'preflight-card';

  const header = document.createElement('div');
  header.className = 'preflight-card-header';
  const title = document.createElement('h3');
  title.className = 'preflight-card-title';
  title.textContent = 'Performance';
  const ring = createProgressRing();
  header.appendChild(title);
  header.appendChild(ring);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'preflight-card-body';
  body.textContent = 'Detecting LCP element…';
  card.appendChild(body);
  panel.appendChild(card);

  // Async LCP detection
  detectLcpElement().then((lcpEl) => {
    body.textContent = '';
    ring.remove();
    const content = buildPerformanceContent(lcpEl);
    body.appendChild(content);
  });

  return panel;
}

function buildAssetsPanel() {
  const panel = document.createElement('div');
  panel.className = 'preflight-tab-panel';
  panel.dataset.tabId = 'assets';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', 'preflight-panel-assets');
  panel.setAttribute('aria-labelledby', 'preflight-tab-assets');

  const card = document.createElement('div');
  card.className = 'preflight-card';

  const header = document.createElement('div');
  header.className = 'preflight-card-header';
  const title = document.createElement('h3');
  title.className = 'preflight-card-title';
  title.textContent = 'Images';
  header.appendChild(title);
  card.appendChild(header);

  const content = buildAssetsContent(
    () => closeModal(),
    () => openModal(),
  );
  card.appendChild(content);
  panel.appendChild(card);
  return panel;
}

function buildMartechPanel() {
  const panel = document.createElement('div');
  panel.className = 'preflight-tab-panel';
  panel.dataset.tabId = 'martech';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', 'preflight-panel-martech');
  panel.setAttribute('aria-labelledby', 'preflight-tab-martech');

  const card = document.createElement('div');
  card.className = 'preflight-card';

  const header = document.createElement('div');
  header.className = 'preflight-card-header';
  const title = document.createElement('h3');
  title.className = 'preflight-card-title';
  title.textContent = 'Martech Metadata';
  header.appendChild(title);
  card.appendChild(header);

  card.appendChild(buildMartechContent());
  panel.appendChild(card);
  return panel;
}

function buildLocalizationPanel() {
  const panel = document.createElement('div');
  panel.className = 'preflight-tab-panel';
  panel.dataset.tabId = 'localization';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', 'preflight-panel-localization');
  panel.setAttribute('aria-labelledby', 'preflight-tab-localization');

  const card = document.createElement('div');
  card.className = 'preflight-card';

  const header = document.createElement('div');
  header.className = 'preflight-card-header';
  const title = document.createElement('h3');
  title.className = 'preflight-card-title';
  title.textContent = 'Localization';
  header.appendChild(title);
  card.appendChild(header);

  card.appendChild(buildLocalizationContent());
  panel.appendChild(card);
  return panel;
}

// ── Modal open / close ────────────────────────────────────────────────────
export function closeModal() {
  if (!overlayEl) return;
  overlayEl.setAttribute('hidden', '');
  restoreNotifications();
  document.removeEventListener('keydown', handleEsc);
}

export function openModal() {
  if (!overlayEl) {
    buildModal();
  }
  overlayEl.removeAttribute('hidden');
  suppressNotifications();
  document.addEventListener('keydown', handleEsc);
  // Focus the modal for accessibility
  modalEl?.focus();
}

function handleEsc(e) {
  if (e.key === 'Escape') closeModal();
}

// ── Modal construction ────────────────────────────────────────────────────
function buildModal() {
  // Overlay
  overlayEl = document.createElement('div');
  overlayEl.className = 'preflight-overlay';
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-modal', 'true');
  overlayEl.setAttribute('aria-label', 'Preflight checks');

  // Close on backdrop click
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeModal();
  });

  // Modal shell
  modalEl = document.createElement('div');
  modalEl.className = 'preflight-modal';
  modalEl.setAttribute('tabindex', '-1');

  // Rail
  railEl = buildRail(TABS, activeTabId, switchTab);
  modalEl.appendChild(railEl);

  // Content area
  const content = document.createElement('div');
  content.className = 'preflight-content';

  // Content header
  const contentHeader = document.createElement('div');
  contentHeader.className = 'preflight-content-header';

  const contentTitle = document.createElement('h2');
  contentTitle.className = 'preflight-content-title';
  contentTitle.textContent = TABS.find((t) => t.id === activeTabId)?.label || 'Preflight';
  contentHeader.appendChild(contentTitle);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'preflight-close-btn';
  closeBtn.setAttribute('aria-label', 'Close preflight');
  closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
  closeBtn.addEventListener('click', closeModal);
  contentHeader.appendChild(closeBtn);
  content.appendChild(contentHeader);

  // Tab panels
  const tabPanels = document.createElement('div');
  tabPanels.className = 'preflight-tab-panels';

  const panels = [
    buildGeneralPanel(),
    buildPerformancePanel(),
    buildAssetsPanel(),
    buildMartechPanel(),
    buildLocalizationPanel(),
  ];

  panels.forEach((panel) => {
    if (panel.dataset.tabId === activeTabId) panel.classList.add('active');
    tabPanels.appendChild(panel);
  });

  content.appendChild(tabPanels);
  modalEl.appendChild(content);
  overlayEl.appendChild(modalEl);
  document.body.appendChild(overlayEl);

  // Update badges after build
  updateBadges();
}

// ── Public init ───────────────────────────────────────────────────────────
/**
 * Initialises the preflight feature.
 * Injects a trigger button and wires up the modal.
 */
export default function init() {
  // Load token + main stylesheets
  const base = import.meta.url.replace(/\/[^/]+$/, '');
  [
    `${base}/preflight-tokens.css`,
    `${base}/preflight.css`,
  ].forEach((href) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  });

  openModal();
}
