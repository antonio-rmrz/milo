import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import preflightApi from '../checks/preflightApi.js';
import { STATUS_TO_ICON_MAP } from '../checks/constants.js';
import { updateBadge } from '../preflight-badges.js';

const { getLcpEntry, runChecks } = preflightApi.performance;

const lcpElResult = signal({ icon: 'purple', title: 'Valid LCP', description: 'Checking...' });
const singleBlockResult = signal({ icon: 'purple', title: 'Single Block', description: 'Checking...' });
const imageSizeResult = signal({ icon: 'purple', title: 'Images size', description: 'Checking...' });
const videoPosterResult = signal({ icon: 'purple', title: 'Videos', description: 'Checking...' });
const fragmentsResult = signal({ icon: 'purple', title: 'Fragments', description: 'Checking...' });
const personalizationResult = signal({ icon: 'purple', title: 'Personalization', description: 'Checking...' });
const placeholdersResult = signal({ icon: 'purple', title: 'Placeholders', description: 'Checking...' });
const iconsResult = signal({ icon: 'purple', title: 'Icons', description: 'Checking...' });
const hasLcpElement = signal(false);

const ICON_TO_CHIP = { green: 'pass', red: 'error', orange: 'warning', purple: 'loading', empty: 'info' };
const ICON_TO_LABEL = { green: 'Pass', red: 'Error', orange: 'Warning', purple: 'Checking', empty: 'N/A' };

async function getResults() {
  const signals = [
    lcpElResult, singleBlockResult, imageSizeResult, videoPosterResult,
    fragmentsResult, personalizationResult, placeholdersResult, iconsResult,
  ];
  const checks = runChecks(window.location.pathname, document);

  const checkPromises = checks.map((resultOrPromise, index) => {
    const signalResult = signals[index];
    return Promise.resolve(resultOrPromise)
      .then((result) => {
        const icon = STATUS_TO_ICON_MAP[result.status] ?? 'orange';
        signalResult.value = {
          icon,
          title: result.title.replace('Performance - ', ''),
          description: result.description,
        };
      })
      .catch((error) => {
        signalResult.value = {
          icon: 'red',
          title: 'Error',
          description: `Error: ${error.message}`,
        };
      });
  });

  await Promise.all(checkPromises);

  const lcp = await getLcpEntry(window.location.pathname, document).catch(() => null);
  hasLcpElement.value = !!(lcp?.element);

  const allSignals = [
    lcpElResult, singleBlockResult, imageSizeResult, videoPosterResult,
    fragmentsResult, personalizationResult, placeholdersResult, iconsResult,
  ];
  const errors = allSignals.filter((s) => s.value.icon === 'red').length;
  const warnings = allSignals.filter((s) => s.value.icon === 'orange').length;
  updateBadge('Performance', errors, warnings);
}

let clonedLcpSection;
async function highlightElement(event) {
  const lcp = await getLcpEntry(window.location.pathname, document);
  if (!lcp) return;
  const lcpSection = lcp.element.closest('.section');
  const tooltip = document.querySelector('.lcp-tooltip-modal');
  if (!tooltip || !lcpSection) return;
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

  tooltip.classList.add('show');
}

const removeHighlight = () => {
  document.querySelector('.lcp-tooltip-modal')?.classList.remove('show');
};

function PerformanceItem({ icon, title, description }) {
  const chipType = ICON_TO_CHIP[icon] || 'info';
  const chipLabel = ICON_TO_LABEL[icon] || icon;
  const isLoading = icon === 'purple';
  return html`
    <div class="preflight-card">
      <div class="preflight-card-header">
        <p class="preflight-card-title">${title}</p>
        <span class="preflight-chip preflight-chip-${chipType}">
          ${isLoading && html`<svg class="progress-ring" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28 10" opacity="0.4"/>
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="10 28"/>
          </svg>`}
          ${chipLabel}
        </span>
      </div>
      <p class="preflight-card-description">${description}</p>
    </div>`;
}

export default function Panel() {
  useEffect(() => { getResults(); }, []);

  return html`
    <div class="preflight-columns">
      <div class="preflight-column">
        <${PerformanceItem} ...${lcpElResult.value} />
        <${PerformanceItem} ...${singleBlockResult.value} />
        <${PerformanceItem} ...${imageSizeResult.value} />
        <${PerformanceItem} ...${videoPosterResult.value} />
      </div>
      <div class="preflight-column">
        <${PerformanceItem} ...${fragmentsResult.value} />
        <${PerformanceItem} ...${personalizationResult.value} />
        <${PerformanceItem} ...${placeholdersResult.value} />
        <${PerformanceItem} ...${iconsResult.value} />
      </div>
      <div><a class="performance-guidelines" href="https://milo.adobe.com/docs/authoring/performance/" target="_blank">Milo Performance Guidelines</a></div>
      ${hasLcpElement.value && html`
        <div>
          <span class="performance-element-preview" onMouseEnter=${highlightElement} onMouseLeave=${removeHighlight}>
            Highlight the found LCP section
          </span>
        </div>
      `}
    </div>
  `;
}
