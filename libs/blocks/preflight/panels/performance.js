import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import preflightApi from '../checks/preflightApi.js';
import { STATUS, STATUS_TO_ICON_MAP } from '../checks/constants.js';
import { updateBadge } from '../badge-counts.js';

const { getLcpEntry, runChecks } = preflightApi.performance;

const lcpElResult = signal({ icon: 'purple', title: 'Valid LCP', description: 'Checking...', status: null, lcpElement: null });
const singleBlockResult = signal({ icon: 'purple', title: 'Single Block', description: 'Checking...', status: null });
const imageSizeResult = signal({ icon: 'purple', title: 'Images size', description: 'Checking...', status: null });
const videoPosterResult = signal({ icon: 'purple', title: 'Videos', description: 'Checking...', status: null });
const fragmentsResult = signal({ icon: 'purple', title: 'Fragments', description: 'Checking...', status: null });
const personalizationResult = signal({ icon: 'purple', title: 'Personalization', description: 'Checking...', status: null });
const placeholdersResult = signal({ icon: 'purple', title: 'Placeholders', description: 'Checking...', status: null });
const iconsResult = signal({ icon: 'purple', title: 'Icons', description: 'Checking...', status: null });

const hasLcpElement = signal(false);

const allSignals = [
  lcpElResult, singleBlockResult, imageSizeResult, videoPosterResult,
  fragmentsResult, personalizationResult, placeholdersResult, iconsResult,
];

function computePerformanceBadge() {
  const errors = allSignals.filter((s) => s.value.status === STATUS.FAIL).length;
  const warnings = allSignals.filter((s) => s.value.status === STATUS.LIMBO).length;
  updateBadge('Performance', errors, warnings);
}

async function getResults() {
  const checks = runChecks(window.location.pathname, document);

  const checkPromises = checks.map((resultOrPromise, index) => {
    const sig = allSignals[index];
    return Promise.resolve(resultOrPromise)
      .then((result) => {
        const icon = STATUS_TO_ICON_MAP[result.status] ?? 'orange';
        sig.value = {
          icon,
          title: result.title.replace('Performance - ', ''),
          description: result.description,
          status: result.status,
          lcpElement: result.lcpElement ?? null,
        };
        if (index === 0) {
          hasLcpElement.value = !!result.lcpElement;
        }
      })
      .catch((error) => {
        sig.value = {
          icon: 'red',
          title: 'Error',
          description: `Error: ${error.message}`,
          status: STATUS.FAIL,
        };
      });
  });

  await Promise.all(checkPromises);
  computePerformanceBadge();
}

const ICON_TO_CHIP = {
  green: 'pass',
  red: 'error',
  orange: 'warn',
  purple: 'loading',
  empty: 'empty',
};

const CHIP_SYMBOLS = {
  pass: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  warn: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  loading: html`<svg class="preflight-progress-ring" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`,
  empty: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg>`,
};

function PerformanceItem({ icon, title, description }) {
  const chipType = ICON_TO_CHIP[icon] || 'empty';
  return html`
    <div class="preflight-card">
      <div class="preflight-chip preflight-chip-${chipType}" aria-hidden="true">${CHIP_SYMBOLS[chipType]}</div>
      <div class="preflight-card-text">
        <p class="preflight-card-title">${title}</p>
        <p class="preflight-card-description">${description}</p>
      </div>
    </div>`;
}

/* LCP section tooltip */
let clonedLcpSection;
async function highlightElement(event) {
  const lcp = await getLcpEntry(window.location.pathname, document);
  if (!lcp) return;
  const lcpSection = lcp.element.closest('.section');
  const tooltip = document.querySelector('.lcp-tooltip-modal');
  const { offsetHeight, offsetWidth } = lcpSection;
  const scaleFactor = Math.min(500 / offsetWidth, 500 / offsetHeight);

  if (!clonedLcpSection) {
    clonedLcpSection = lcpSection.cloneNode(true);
    clonedLcpSection.classList.add('lcp-clone');
  }

  Object.assign(clonedLcpSection.style, {
    width: `${lcpSection.offsetWidth}px`,
    height: `${lcpSection.offsetHeight}px`,
    transform: `scale(${scaleFactor})`,
    transformOrigin: 'top left',
  });

  if (!tooltip.children.length) tooltip.appendChild(clonedLcpSection);

  const { top, left } = event.currentTarget.getBoundingClientRect();
  Object.assign(tooltip.style, {
    width: `${offsetWidth * scaleFactor}px`,
    height: `${offsetHeight * scaleFactor}px`,
    top: `${top + window.scrollY - offsetHeight * scaleFactor - 10}px`,
    left: `${left + window.scrollX}px`,
  });

  document.querySelector('.lcp-tooltip-modal').classList.add('show');
}

const removeHighlight = () => {
  document.querySelector('.lcp-tooltip-modal').classList.remove('show');
};

export default function Panel() {
  useEffect(() => {
    getResults();
  }, []);

  const leftItems = [lcpElResult, singleBlockResult, imageSizeResult, videoPosterResult];
  const rightItems = [fragmentsResult, personalizationResult, placeholdersResult, iconsResult];

  return html`
    <div class="preflight-columns">
      <div class="preflight-column">
        ${leftItems.map((s) => html`<${PerformanceItem} ...${s.value} />`)}
      </div>
      <div class="preflight-column">
        ${rightItems.map((s) => html`<${PerformanceItem} ...${s.value} />`)}
      </div>
      <div>
        <a class="performance-guidelines" href="https://milo.adobe.com/docs/authoring/performance/" target="_blank">Milo Performance Guidelines</a>
      </div>
      ${hasLcpElement.value && html`
        <div>
          <span class="performance-element-preview" onMouseEnter=${highlightElement} onMouseLeave=${removeHighlight}>
            Highlight the found LCP section
          </span>
        </div>
      `}
      <div class="lcp-tooltip-modal"></div>
    </div>
  `;
}
