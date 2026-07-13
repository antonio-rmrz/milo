import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { injectBackPopover } from '../preflight.js';

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
 * Navigate to an asset element on the page: close the modal, scroll to element,
 * inject the Back-to-Preflight popover.
 */
function navigateToAsset(src) {
  const modal = document.querySelector('.dialog-modal#preflight');
  const closeBtn = modal?.querySelector('.dialog-close');

  const reopen = () => {
    const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
    sidekick?.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
  };

  injectBackPopover(reopen);

  if (closeBtn) {
    closeBtn.click();
  }

  const img = document.querySelector(`img[src="${src}"], video[src="${src}"]`);
  if (!img) return;

  // Scroll target into view
  img.scrollIntoView({ behavior: 'smooth', block: 'center' });
  img.style.outline = '3px solid #0265dc';
  img.style.outlineOffset = '2px';
  setTimeout(() => { img.style.outline = ''; img.style.outlineOffset = ''; }, 3000);
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
 * Compact asset row with thumbnail, metrics, and click-to-navigate.
 */
function AssetRow({ asset, isCritical }) {
  const srcParts = asset.src ? asset.src.split('/') : [];
  const filename = srcParts[srcParts.length - 1] || asset.src || 'Asset';

  return html`
    <div
      class=${`assets-row${isCritical ? ' is-critical' : ''}`}
      title="Click to navigate to this asset on the page"
      onClick=${() => navigateToAsset(asset.src)}>
      ${asset.type === 'image' && html`<img class="assets-row-thumb" src=${asset.src} alt="" loading="lazy" />`}
      ${asset.type !== 'image' && html`<div class="assets-row-thumb"></div>`}
      <div class="assets-row-metrics">
        <span class="assets-row-name">${filename}</span>
        <div class="assets-row-meta">
          ${asset.naturalDimensions && html`<span>Upload size: ${asset.naturalDimensions}</span>`}
          ${asset.displayDimensions && html`<span>Display size: ${asset.displayDimensions}</span>`}
          ${asset.typeLabel && html`<span>${asset.typeLabel}</span>`}
          ${isCritical && html`<span class="preflight-chip preflight-chip-error">Critical</span>`}
          ${!isCritical && asset.hasMismatch && html`<span class="preflight-chip preflight-chip-warning">Mismatch</span>`}
        </div>
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
      <div>
        ${assetArray.value.map((asset) => html`<${AssetRow} asset=${asset} isCritical=${isCriticalGroup} />`)}
      </div>
    `}

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
