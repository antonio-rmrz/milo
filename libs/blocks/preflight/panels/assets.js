import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { createTag } from '../../../utils/utils.js';

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

export function getBadgeCounts() {
  return {
    errors: criticalAssetFailures.value.length,
    warnings: warningAssetFailures.value.length,
  };
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
 * Re-opens the preflight modal, preferring the sidekick event the page-level
 * plugin already listens for; falls back to building the modal directly.
 */
async function reopenPreflight() {
  const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
  if (sidekick) {
    sidekick.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
    return;
  }
  const [{ getModal }, { default: initPreflight }] = await Promise.all([
    import('../../modal/modal.js'),
    import('../preflight.js'),
  ]);
  const content = createTag('div', { class: 'preflight' });
  await initPreflight(content);
  getModal(null, { id: 'preflight', content, closeEvent: 'closeModal' });
}

/**
 * Shows the 'Back to Preflight' popover pinned to the top-left of the screen.
 */
function showBackToPreflight() {
  document.querySelector('.preflight-back-popover')?.remove();
  const button = createTag('button', { type: 'button' }, 'Back to Preflight');
  const popover = createTag('div', { class: 'preflight-back-popover' }, button);
  button.addEventListener('click', () => {
    popover.remove();
    reopenPreflight();
  });
  document.body.append(popover);
}

/**
 * Closes the preflight modal, scrolls the asset into view, and offers a way
 * back via the 'Back to Preflight' popover.
 */
export async function navigateToAsset(assetEl) {
  if (!assetEl?.scrollIntoView) return;
  const dialog = document.querySelector('.dialog-modal#preflight');
  if (dialog) {
    const { closeModal } = await import('../../modal/modal.js');
    await closeModal(dialog);
  }
  assetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showBackToPreflight();
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
 * Single metric row inside an asset card.
 */
function AssetMetric({ label, value, isCritical }) {
  return html`
    <div class="asset-metric">
      <span class="asset-metric-label">${label}</span>
      <span class="asset-metric-value${isCritical ? ' is-critical' : ''}">${value}</span>
    </div>`;
}

/**
 * Compact asset card with thumbnail, metric rows, and click-to-navigate.
 */
function AssetCard({ asset, isCritical }) {
  const canNavigate = !!asset.asset?.isConnected;
  const title = (isCritical && 'Above-the-fold asset with critical dimension issues')
    || (canNavigate && 'Click to locate this asset on the page')
    || '';

  const handleClick = (e) => {
    if (e.target.closest('video, iframe, a')) return;
    navigateToAsset(asset.asset);
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    navigateToAsset(asset.asset);
  };

  return html`
    <div
      class="assets-image-grid-item${isCritical ? ' above-fold-critical' : ''}"
      title=${title}
      role=${canNavigate ? 'button' : undefined}
      tabindex=${canNavigate ? 0 : undefined}
      onClick=${canNavigate ? handleClick : undefined}
      onKeyDown=${canNavigate ? handleKeyDown : undefined}>
      ${asset.type === 'image' && html`<img src=${asset.src} alt="" />`}
      ${asset.type === 'video' && html`<video controls src=${asset.src} />`}
      ${asset.type === 'mpc' && html`<iframe src=${asset.src} title="Video preview" />`}
      <div class="assets-image-grid-item-text">
        <${AssetMetric} label="Factor" value=${asset.roundedFactor} isCritical=${isCritical} />
        <${AssetMetric} label="Upload size" value=${asset.naturalDimensions} />
        <${AssetMetric} label="Display size" value=${asset.displayDimensions} />
        ${asset.hasMismatch && html`<${AssetMetric} label="Recommended" value=${asset.recommendedDimensions} />`}
        <${AssetMetric} label="Type" value=${asset.typeLabel} />
        ${asset.notes && html`<p class="asset-note">${asset.notes}</p>`}
        ${isCritical && html`<span class="preflight-chip preflight-chip-error">Critical</span>`}
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
      ${assetArray.value.map((asset) => html`<${AssetCard} asset=${asset} isCritical=${isCriticalGroup} />`)}
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
