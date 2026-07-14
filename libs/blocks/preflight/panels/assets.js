import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { openPreflight } from '../preflight.js';
import { setTabBadge } from '../preflight-state.js';

// Define signals for check results and viewport status
const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
  chipClass: 'loading',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
const criticalAssetFailures = signal([]);
const warningAssetFailures = signal([]);
const viewportTooSmall = signal(isViewportTooSmall());

let backPopoverEl = null;

function removeBackPopover() {
  if (backPopoverEl) {
    backPopoverEl.remove();
    backPopoverEl = null;
  }
}

function showBackPopover() {
  removeBackPopover();
  backPopoverEl = document.createElement('div');
  backPopoverEl.className = 'preflight-back-popover';
  backPopoverEl.innerHTML = `
    <button class="preflight-back-btn">Back to Preflight</button>
    <button class="preflight-back-close" aria-label="Close">&#x2715;</button>
  `;
  backPopoverEl.querySelector('.preflight-back-btn').addEventListener('click', () => {
    removeBackPopover();
    openPreflight();
  });
  backPopoverEl.querySelector('.preflight-back-close').addEventListener('click', removeBackPopover);
  document.body.appendChild(backPopoverEl);
}

function navigateToAsset(asset) {
  const dialog = document.querySelector('.dialog-modal#preflight');
  if (dialog) {
    dialog.setAttribute('aria-hidden', 'true');
    dialog.style.display = 'none';
  }

  const doScroll = () => {
    if (asset) {
      asset.scrollIntoView({ behavior: 'smooth', block: 'center' });
      asset.focus?.();
    }
    showBackPopover();
  };

  if (dialog) {
    dialog.addEventListener('transitionend', doScroll, { once: true });
    setTimeout(doScroll, 300);
  } else {
    doScroll();
  }
}

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

  const STATUS_TO_CHIP = {
    [STATUS.PASS]: 'pass',
    [STATUS.FAIL]: 'fail',
    [STATUS.LIMBO]: 'warn',
    [STATUS.EMPTY]: 'empty',
  };

  assetDimensionsResult.value = {
    title: result.title.replace('Assets - ', ''),
    description: result.description,
    chipClass: STATUS_TO_CHIP[result.status] || 'empty',
  };

  if (result.details) {
    assetsWithMismatch.value = result.details.assetsWithMismatch || [];
    assetsWithMatch.value = result.details.assetsWithMatch || [];
    criticalAssetFailures.value = result.details.criticalAssetFailures || [];
    warningAssetFailures.value = result.details.warningAssetFailures || [];
  }

  const errors = (result.details?.criticalAssetFailures || []).length;
  const warnings = (result.details?.warningAssetFailures || []).length;
  if (errors || warnings) setTabBadge('Assets', errors, warnings);
}

/**
 * Component to display a single asset check result.
 */
function AssetsItem({ title, description, chipClass }) {
  const chip = chipClass || 'loading';
  const isLoading = chip === 'loading';
  return html`
    <div class="assets-item">
      ${isLoading ? html`<div class="preflight-progress-ring"></div>` : null}
      <div class="assets-item-text">
        <p class="assets-item-title">${title}</p>
        <span class="preflight-chip ${chip}">${chip}</span>
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

    const handleClick = () => {
      if (asset.asset) navigateToAsset(asset.asset);
    };

    return html`
      <div
        class='${itemClass}'
        title='${isAboveFoldWithMismatch ? 'Above-the-fold asset with critical dimension issues — click to navigate' : 'Click to navigate to asset'}'
        onClick=${handleClick}
        role="button"
        tabIndex="0"
        onKeyDown=${(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}>
        ${asset.type === 'image' && html`<img src='${asset.src}' alt="" />`}
        ${asset.type === 'video' && html`<video controls src='${asset.src}' />`}
        ${asset.type === 'mpc' && html`<iframe src='${asset.src}' title="video" />`}
        <div class='assets-image-grid-item-text'>
          <span>Factor: ${asset.roundedFactor}</span>
          <span>Upload size: ${asset.naturalDimensions}</span>
          <span>Display size: ${asset.displayDimensions}</span>
          ${asset.hasMismatch && html`<span>Recommended size: ${asset.recommendedDimensions}</span>`}
          <span>Type: ${asset.typeLabel}</span>
          ${asset.notes && html`<span><strong>Notes:</strong> ${asset.notes}</span>`}
          ${isAboveFoldWithMismatch && html`<span class="above-fold-notice"><strong>CRITICAL:</strong></span>`}
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
