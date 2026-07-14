import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { updateBadge } from '../preflight-badges.js';

const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
const criticalAssetFailures = signal([]);
const warningAssetFailures = signal([]);
const viewportTooSmall = signal(isViewportTooSmall());

function removeBackPopover() {
  document.querySelector('.back-to-preflight')?.remove();
}

function createBackPopover(reopenCallback) {
  removeBackPopover();
  const btn = document.createElement('button');
  btn.className = 'back-to-preflight';
  btn.textContent = 'Back to Preflight';
  btn.addEventListener('click', () => {
    removeBackPopover();
    reopenCallback();
  });
  document.body.appendChild(btn);
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

  const errors = (result.details?.criticalAssetFailures || []).length;
  const warnings = (result.details?.warningAssetFailures || []).length;
  updateBadge('Assets', errors, warnings);
}

function AssetsItem({ title, description }) {
  return html`
    <div class="assets-item">
      <p class="assets-item-title">${title}</p>
      <p class="assets-item-description">${description}</p>
    </div>`;
}

function AssetRow({ asset, isCritical, onNavigate }) {
  const { src } = asset;

  return html`
    <div
      class="assets-image-grid-item${isCritical ? ' above-fold-critical' : ''}"
      title=${isCritical ? 'Above-the-fold asset with critical dimension issues' : ''}
      onClick=${() => onNavigate(asset)}>
      ${asset.type === 'image' && html`<img src=${src} alt="" />`}
      ${asset.type === 'video' && html`<video src=${src} />`}
      ${asset.type === 'mpc' && html`<iframe src=${src} title="video" />`}
      <div class="assets-image-grid-item-text">
        <span>${src ? src.split('/').pop() : 'Asset'}</span>
        <span>Factor: ${asset.roundedFactor}</span>
        <span>Upload: ${asset.naturalDimensions}</span>
        <span>Display: ${asset.displayDimensions}</span>
        ${asset.hasMismatch && html`<span>Recommended: ${asset.recommendedDimensions}</span>`}
        <span>Type: ${asset.typeLabel}</span>
        ${asset.notes && html`<span>${asset.notes}</span>`}
        ${isCritical && html`<span class="above-fold-notice">CRITICAL</span>`}
      </div>
    </div>`;
}

function AssetGroup({ group, onNavigate }) {
  const { title, assetArray, isCritical } = group;

  return html`
    <div>
      <div class="assets-columns grid-heading">
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
            <${AssetRow} asset=${asset} isCritical=${isCritical} onNavigate=${onNavigate} />
          `)}
        </div>
      `}

      ${!viewportTooSmall.value && assetArray.value.length === 0 && html`
        <div class="assets-image-grid">
          <div class="assets-image-grid-item full-width">No assets found</div>
        </div>
      `}
    </div>
  `;
}

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

  function navigateToAsset(asset) {
    const el = asset.asset;
    if (!el) return;

    // Close preflight modal
    const closeBtn = document.querySelector('.dialog-modal#preflight .dialog-close');
    if (closeBtn) closeBtn.click();

    // Scroll to element
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Inject back popover
    createBackPopover(() => {
      const openBtn = document.querySelector('aem-sidekick, helix-sidekick');
      if (openBtn) {
        openBtn.dispatchEvent(new CustomEvent('preflight:reopen', { bubbles: true }));
      }
      // Fallback: find and click any preflight trigger
      const pfTrigger = document.querySelector('[data-preflight-trigger]');
      if (pfTrigger) pfTrigger.click();
    });
  }

  const groups = [
    { title: 'Critical Asset Issues (Above-the-fold)', assetArray: criticalAssetFailures, isCritical: true },
    { title: 'Warning Asset Issues (Below-the-fold)', assetArray: warningAssetFailures, isCritical: false },
    { title: 'Assets with matching dimensions', assetArray: assetsWithMatch, isCritical: false },
  ];

  return html`
    <div class="assets-columns">
      <${AssetsItem} ...${assetDimensionsResult.value} />
      ${groups.map((group) => html`<${AssetGroup} group=${group} onNavigate=${navigateToAsset} />`)}
    </div>
  `;
}
