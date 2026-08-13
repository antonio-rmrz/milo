import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';

// Module-level signals — reset on each mount to avoid stale data
export const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
export const assetsWithMismatch = signal([]);
export const assetsWithMatch = signal([]);
export const criticalAssetFailures = signal([]);
export const warningAssetFailures = signal([]);
export const viewportTooSmall = signal(isViewportTooSmall());

function resetSignals() {
  assetDimensionsResult.value = { title: 'Asset Dimensions', description: 'Checking...' };
  assetsWithMismatch.value = [];
  assetsWithMatch.value = [];
  criticalAssetFailures.value = [];
  warningAssetFailures.value = [];
  viewportTooSmall.value = isViewportTooSmall();
}

async function getResults() {
  const results = await getPreflightResults({
    url: window.location.pathname,
    area: document,
    useCache: false,
    injectVisualMetadata: false,
  });

  if (!results) return;

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

function mountBackToPreflightPopover() {
  if (document.querySelector('.back-to-preflight-popover')) return;
  const btn = document.createElement('button');
  btn.className = 'back-to-preflight-popover';
  btn.textContent = 'Back to Preflight';
  btn.addEventListener('click', () => {
    btn.remove();
    const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
    if (sidekick) {
      sidekick.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
    }
  });
  document.body.appendChild(btn);
}

function navigateToAsset(asset) {
  window.dispatchEvent(new CustomEvent('preflight:close'));
  if (asset?.asset) {
    asset.asset.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  mountBackToPreflightPopover();
}

function AssetsItem({ title, description }) {
  return html`
    <div class="assets-item">
      <p class="assets-item-title">${title}</p>
      <p class="assets-item-description">${description}</p>
    </div>`;
}

function AssetRow({ asset, isCritical }) {
  const itemClass = isCritical ? 'assets-image-grid-item above-fold-critical' : 'assets-image-grid-item';

  return html`
    <div
      class=${itemClass}
      title="Click to navigate to this asset"
      onClick=${() => navigateToAsset(asset)}>
      ${asset.type === 'image' && html`<img class="assets-thumbnail" src=${asset.src} alt="" />`}
      ${asset.type !== 'image' && html`<div class="assets-thumbnail-placeholder">${asset.type}</div>`}
      <div class="assets-image-grid-item-text">
        <span>${asset.src?.split('/').pop() || asset.src}</span>
        <span>Factor: ${asset.roundedFactor} | ${asset.naturalDimensions} → ${asset.displayDimensions}</span>
        ${asset.hasMismatch && html`<span>Recommended: ${asset.recommendedDimensions}</span>`}
        ${asset.typeLabel && html`<span>Type: ${asset.typeLabel}</span>`}
      </div>
    </div>`;
}

function AssetGroup({ group }) {
  const { title, assetArray } = group;
  const isCriticalGroup = title.includes('Critical');

  return html`
    <div class="grid-heading">
      <div class="grid-toggle">${title}</div>
    </div>

    ${viewportTooSmall.value && html`
      <div class="assets-image-grid">
        <div class="assets-image-grid-item full-width">Please resize your browser to at least 1200px width to run image checks</div>
      </div>
    `}

    ${!viewportTooSmall.value && assetArray.value.length > 0 && html`
      <div class="assets-image-grid">
        ${assetArray.value.map((asset) => html`
          <${AssetRow} asset=${asset} isCritical=${isCriticalGroup} />
        `)}
      </div>
    `}

    ${!viewportTooSmall.value && assetArray.value.length === 0 && html`
      <div class="assets-image-grid">
        <div class="assets-image-grid-item full-width">No assets found</div>
      </div>
    `}
  `;
}

export default function Assets() {
  useEffect(() => {
    // Reset signals to avoid stale data from a previous mount
    resetSignals();

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
