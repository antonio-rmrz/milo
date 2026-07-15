import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import preflightApi from '../checks/preflightApi.js';
import { STATUS, STATUS_TO_ICON_MAP } from '../checks/constants.js';

const { getLcpEntry, runChecks } = preflightApi.performance;

const lcpElResult = signal({ icon: 'purple', title: 'Valid LCP', description: 'Checking...' });
const singleBlockResult = signal({ icon: 'purple', title: 'Single Block', description: 'Checking...' });
const imageSizeResult = signal({ icon: 'purple', title: 'Images size', description: 'Checking...' });
const videoPosterResult = signal({ icon: 'purple', title: 'Videos', description: 'Checking...' });
const fragmentsResult = signal({ icon: 'purple', title: 'Fragments', description: 'Checking...' });
const personalizationResult = signal({ icon: 'purple', title: 'Personalization', description: 'Checking...' });
const placeholdersResult = signal({ icon: 'purple', title: 'Placeholders', description: 'Checking...' });
const iconsResult = signal({ icon: 'purple', title: 'Icons', description: 'Checking...' });

const hasLcpElement = signal(true);

async function getResults() {
  const signals = [
    lcpElResult,
    singleBlockResult,
    imageSizeResult,
    videoPosterResult,
    fragmentsResult,
    personalizationResult,
    placeholdersResult,
    iconsResult,
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
          status: result.status,
        };
        if (index === 0) {
          hasLcpElement.value = !(result.status === STATUS.FAIL
            && result.description?.toLowerCase().includes('no lcp'));
        }
      })
      .catch((error) => {
        signalResult.value = {
          icon: 'red',
          title: 'Error',
          description: `Error: ${error.message}`,
          status: STATUS.FAIL,
        };
      });
  });

  await Promise.all(checkPromises);

  const failCount = signals.filter((s) => s.value.status === STATUS.FAIL).length;
  const limboCount = signals.filter((s) => s.value.status === STATUS.LIMBO).length;
  const type = failCount > 0 ? 'error' : 'warn';
  const count = failCount > 0 ? failCount : limboCount;
  if (count > 0) {
    document.dispatchEvent(new CustomEvent('preflight:badge', { detail: { title: 'Performance', count, type } }));
  }
}

function statusToChipStatus(icon) {
  if (icon === 'green') return 'pass';
  if (icon === 'red') return 'fail';
  if (icon === 'orange') return 'warn';
  if (icon === 'purple') return 'loading';
  return 'empty';
}

function PerformanceItem({ icon, title, description }) {
  const chipStatus = statusToChipStatus(icon);
  return html`
    <div class="preflight-check-card preflight-item">
      <div class="preflight-check-card-body">
        <p class="preflight-item-title">${title}</p>
        <p class="preflight-item-description">${description}</p>
      </div>
      <span class="status-chip" data-status=${chipStatus}>${chipStatus}</span>
    </div>`;
}

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
      <div>Unsure on how to get this page fully into the green? Check out the <a class="performance-guidelines" href="https://milo.adobe.com/docs/authoring/performance/" target="_blank">Milo Performance Guidelines</a>.</div>
      ${hasLcpElement.value && html`
        <div>
          <span class="performance-element-preview" onMouseEnter=${highlightElement} onMouseLeave=${removeHighlight}>
            Highlight the found LCP section
          </span>
        </div>
        <div class="lcp-tooltip-modal"></div>
      `}
    </div>
  `;
}
