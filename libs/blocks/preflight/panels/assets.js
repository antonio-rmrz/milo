import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { updateBadge } from '../badge-counts.js';

const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
const criticalAssetFailures = signal([]);
const warningAssetFailures = signal([]);
const viewportTooSmall = signal(isViewportTooSmall());

function showBackPopover() {
  if (document.querySelector('.preflight-back-popover')) return;
  const popover = document.createElement('div');
  popover.className = 'preflight-back-popover';
  popover.innerHTML = '<span>Back to</span><button type="button">Preflight</button>';
  popover.querySelector('button').addEventListener('click', () => {
    popover.remove();
    try {
      sessionStorage.setItem('preflight-back', JSON.stringify({ reopen: true, ts: Date.now() }));
    } catch { /* ignore */ }
    const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
    sidekick?.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
  });
  document.body.appendChild(popover);
}

function navigateToAsset(asset) {
  const dialog = document.querySelector('dialog#preflight, .dialog-modal#preflight');
  if (dialog) {
    dialog.close?.();
    dialog.setAttribute('hidden', '');
    dialog.style.display = 'none';
  }

  requestAnimationFrame(() => {
    asset.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const prev = asset.style.outline;
    asset.style.outline = '3px solid #3b63fb';
    setTimeout(() => { asset.style.outline = prev; }, 2000);
    showBackPopover();
  });
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

  const errors = criticalAssetFailures.value.length;
  const warnings = warningAssetFailures.value.length;
  updateBadge('Assets', errors, warnings);
}

function AssetThumb({ asset }) {
  if (asset.type === 'image') {
    return html`<div class="assets-thumb"><img src=${asset.src} alt="" loading="lazy" /></div>`;
  }
  if (asset.type === 'video') {
    return html`<div class="assets-thumb"><video src=${asset.src} muted /></div>`;
  }
  if (asset.type === 'mpc') {
    return html`<div class="assets-thumb"><iframe src=${asset.src} title="video" /></div>`;
  }
  return html`<div class="assets-thumb"></div>`;
}

function AssetRow({ asset, isCritical }) {
  const handleClick = () => {
    if (asset.asset) navigateToAsset(asset.asset);
  };

  return html`
    <div
      class="assets-image-grid-item${isCritical ? ' above-fold-critical' : ''}"
      title=${isCritical ? 'Above-the-fold asset with critical dimension issues' : ''}
      onClick=${handleClick}
      role="button"
      tabindex="0"
      onKeyDown=${(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}>
      <${AssetThumb} asset=${asset} />
      <div class="assets-image-grid-item-text">
        <span>Factor: ${asset.roundedFactor}</span>
        <span>Upload size: ${asset.naturalDimensions}</span>
        <span>Display: ${asset.displayDimensions}</span>
        ${asset.hasMismatch && html`<span>Ideal: ${asset.recommendedDimensions}</span>`}
        <span>${asset.typeLabel}</span>
        ${asset.notes && html`<span>${asset.notes}</span>`}
        ${isCritical && html`<span class="above-fold-notice">CRITICAL: above fold</span>`}
      </div>
    </div>`;
}

function AssetGroup({ title, assetArray, isCritical }) {
  return html`
    <div>
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
            <${AssetRow} asset=${asset} isCritical=${isCritical} />
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

function AssetsItem({ title, description }) {
  return html`
    <div class="assets-item">
      <div class="assets-item-text">
        <p class="assets-item-title">${title}</p>
        <p class="assets-item-description">${description}</p>
      </div>
    </div>`;
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

  const groups = [
    { title: 'Critical Asset Issues (Above-the-fold)', assetArray: criticalAssetFailures, isCritical: true },
    { title: 'Warning Asset Issues (Below-the-fold)', assetArray: warningAssetFailures, isCritical: false },
    { title: 'Assets with matching dimensions', assetArray: assetsWithMatch, isCritical: false },
  ];

  return html`
    <div class="assets-columns">
      <${AssetsItem} ...${assetDimensionsResult.value} />
      ${groups.map((group) => html`<${AssetGroup} ...${group} />`)}
    </div>
  `;
}
