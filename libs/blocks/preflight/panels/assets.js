import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';

/**
 * Close the preflight modal (dialog), scroll to the target element,
 * and inject a fixed 'Back to Preflight' popover.
 * @param {Element|null} targetEl - The page element to scroll to.
 * @param {Function} reopenFn - Callback that re-opens the preflight modal.
 */
export function navigateToAsset(targetEl, reopenFn) {
  // Remove any existing popover first
  const existing = document.querySelector('.preflight-back-popover');
  if (existing) existing.remove();

  // Close the preflight dialog
  const dialog = document.querySelector('.dialog-modal#preflight');
  if (dialog) {
    const closeBtn = dialog.querySelector('[daa-ll="Close"], .dialog-close, button[aria-label="Close"]');
    if (closeBtn) {
      closeBtn.click();
    } else {
      dialog.style.display = 'none';
    }
  }

  // Scroll to the element
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Inject Back-to-Preflight popover
  const popover = document.createElement('div');
  popover.className = 'preflight-back-popover';
  popover.setAttribute('role', 'complementary');
  popover.setAttribute('aria-label', 'Back to Preflight');

  const btn = document.createElement('button');
  btn.className = 'preflight-back-popover-btn';
  btn.textContent = '← Back to Preflight';
  btn.setAttribute('type', 'button');
  btn.addEventListener('click', () => {
    popover.remove();
    if (typeof reopenFn === 'function') reopenFn();
  });

  popover.appendChild(btn);
  document.body.appendChild(popover);
}

// Define signals for check results and viewport status
const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
const criticalAssetFailures = signal([]);
const warningAssetFailures = signal([]);
const viewportTooSmall = signal(isViewportTooSmall());

/**
 * Runs asset checks and updates signals with the results.
 */
async function getResults() {
  const results = await getPreflightResults({
    url: window.location.pathname,
    area: document,
    useCache: false,
    injectVisualMetadata: false,
  });

  if (!results) return; // Page is excluded from preflight checks

  const checks = results.runChecks.assets || [];

  const result = await Promise.resolve(checks[0]).catch((error) => ({
    title: 'Assets - Image Dimensions',
    status: STATUS.FAIL,
    description: `Error: ${error.message}`,
  }));

  assetDimensionsResult.value = {
    title: result.title.replace('Assets - ', ''),
    description: result.description,
  };

  if (result.details) {
    assetsWithMismatch.value = result.details.assetsWithMismatch || [];
    assetsWithMatch.value = result.details.assetsWithMatch || [];
    criticalAssetFailures.value = result.details.criticalAssetFailures || [];
    warningAssetFailures.value = result.details.warningAssetFailures || [];
  }
}

/**
 * Component to display a single asset check result.
 */
function AssetsItem({ title, description }) {
  return html`
    <div class="assets-item">
      <div class="assets-item-text">
        <p class="assets-item-title">${title}</p>
        <p class="assets-item-description">${description}</p>
      </div>
    </div>`;
}

/**
 * Component to display a group of assets.
 */
function AssetGroup({ group }) {
  const { title, assetArray } = group;
  const isCriticalGroup = title.includes('Critical');

  return html`
    <div class="grid-heading">
      <div class="grid-toggle">${title}</div>
    </div>

    ${viewportTooSmall.value && html`
      <div class='assets-image-grid'>
        <div class='assets-image-grid-item full-width'>Please resize your browser to at least 1200px width to run image checks</div>
      </div>
    `}

    ${!viewportTooSmall.value && assetArray.value.length > 0 && html`
    <div class='assets-image-grid'>
      ${assetArray.value.map((asset) => {
    const isAboveFoldWithMismatch = isCriticalGroup;
    const itemClass = isAboveFoldWithMismatch ? 'assets-image-grid-item above-fold-critical' : 'assets-image-grid-item';

    const handleAssetClick = () => {
      const el = document.querySelector(`img[src='${asset.src}'], video[src='${asset.src}']`);
      navigateToAsset(el, () => {
        // Re-open by dispatching a custom event that the modal host can listen to
        document.dispatchEvent(new CustomEvent('preflight:reopen'));
      });
    };
    return html`
      <div
        class='${itemClass}'
        title='${isAboveFoldWithMismatch ? 'Above-the-fold asset with critical dimension issues' : ''}'
        role="button"
        tabindex="0"
        onClick=${handleAssetClick}
        onKeyDown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAssetClick(); } }}>
        ${asset.type === 'image' && html`<img src='${asset.src}' />`}
        ${asset.type === 'video' && html`<video controls src='${asset.src}' />`}
        ${asset.type === 'mpc' && html`<iframe src='${asset.src}' />`}
        <div class='assets-image-grid-item-text'>
          <span>Factor: ${asset.roundedFactor}</span>
          <span>Upload size: ${asset.naturalDimensions}</span>
          <span>Display size: ${asset.displayDimensions}</span>
          ${asset.hasMismatch && html`<span>Recommended size: ${asset.recommendedDimensions}</span>`}
          <span>Type: ${asset.typeLabel}</span>
          ${asset.notes && html`<span><strong>Notes:</strong> ${asset.notes}</span>`}
          ${isAboveFoldWithMismatch && html`<span class="above-fold-notice"><strong>⚠️ CRITICAL:</strong></span>`}
        </div>
      </div>`;
  })}
    </div>`}

    ${!viewportTooSmall.value && assetArray.value.length === 0 && html`
      <div class='assets-image-grid'>
        <div class='assets-image-grid-item full-width'>No assets found</div>
      </div>
    `}
  `;
}

/**
 * Main Panel Component
 */
export default function Assets() {
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const isSmall = isViewportTooSmall();
        if (viewportTooSmall.value !== isSmall) {
          viewportTooSmall.value = isSmall;
          if (!isSmall) getResults();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    if (!viewportTooSmall.value) getResults();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const groups = [
    { title: 'Critical Asset Issues (Above-the-fold)', assetArray: criticalAssetFailures },
    { title: 'Warning Asset Issues (Below-the-fold)', assetArray: warningAssetFailures },
    { title: 'Assets with matching dimensions', assetArray: assetsWithMatch },
  ];

  return html`
    <div class="assets-columns">
      <${AssetsItem} ...${assetDimensionsResult.value} />
      ${groups.map((group) => html`<${AssetGroup} group=${group} />`)}
    </div>
  `;
}
