import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { setTabBadge } from '../preflight.js';

const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
const criticalAssetFailures = signal([]);
const warningAssetFailures = signal([]);
const viewportTooSmall = signal(isViewportTooSmall());
const backToPreflightVisible = signal(false);

let lastPreflightEl = null;

function closePreflightModal() {
  const closeBtn = document.querySelector('#preflight .dialog-close, .dialog-modal#preflight .dialog-close');
  if (closeBtn) {
    lastPreflightEl = document.querySelector('.dialog-modal#preflight');
    closeBtn.click();
  }
}

function reopenPreflight() {
  backToPreflightVisible.value = false;
  const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
  if (sidekick) {
    sidekick.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
    return;
  }
  if (lastPreflightEl) {
    lastPreflightEl.removeAttribute('hidden');
    document.dispatchEvent(new CustomEvent('preflight:open'));
  }
}

function navigateToElement(element) {
  if (!element) return;
  closePreflightModal();
  setTimeout(() => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.style.outline = '3px solid var(--s2a-color-background-brand, #eb1000)';
    element.style.outlineOffset = '2px';
    backToPreflightVisible.value = true;
  }, 300);
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

  const errorCount = (result.details?.criticalAssetFailures || []).length;
  const warningCount = (result.details?.warningAssetFailures || []).length;
  setTabBadge('Assets', errorCount, warningCount);
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

function AssetRow({ asset, isCritical }) {
  const chipClass = isCritical ? 'preflight-status-chip chip-fail' : 'preflight-status-chip chip-warning';
  const chipLabel = isCritical ? 'CRITICAL' : 'WARNING';

  return html`
    <div
      class="preflight-check-card"
      style="cursor: pointer;"
      onClick=${() => navigateToElement(asset.element)}
      title="Click to navigate to this element on the page"
    >
      <div style="flex-shrink:0; width:80px; height:60px; overflow:hidden; border-radius:4px; background:var(--s2a-color-background-subtle); display:flex; align-items:center; justify-content:center;">
        ${asset.type === 'image' && html`<img src="${asset.src}" style="width:100%;height:100%;object-fit:cover;" />`}
        ${asset.type === 'video' && html`<video src="${asset.src}" style="width:100%;height:100%;object-fit:cover;" />`}
        ${asset.type === 'mpc' && html`<span style="font-size:11px;color:var(--s2a-color-content-subtle);">iframe</span>`}
      </div>
      <div class="preflight-check-card-body">
        <p class="preflight-check-card-title" style="font-size:12px; margin-bottom:6px; word-break:break-all;">${asset.src}</p>
        <div style="display:flex; flex-wrap:wrap; gap:6px; font-size:12px; color:var(--s2a-color-content-subtle); margin-bottom:6px;">
          <span><strong>Factor:</strong> ${asset.roundedFactor}</span>
          <span><strong>Upload:</strong> ${asset.naturalDimensions}</span>
          <span><strong>Display:</strong> ${asset.displayDimensions}</span>
          ${asset.hasMismatch && html`<span><strong>Recommended:</strong> ${asset.recommendedDimensions}</span>`}
        </div>
        <span class="${chipClass}">${chipLabel}</span>
      </div>
    </div>`;
}

function AssetGroup({ group }) {
  const { title, assetArray, isCritical } = group;

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
      <div style="display:flex;flex-direction:column;gap:0;margin-bottom:16px;">
        ${assetArray.value.map((asset) => html`<${AssetRow} asset=${asset} isCritical=${isCritical} />`)}
      </div>
    `}

    ${!viewportTooSmall.value && assetArray.value.length === 0 && html`
      <div class="assets-image-grid">
        <div class="assets-image-grid-item full-width">No assets found</div>
      </div>
    `}
  `;
}

function BackToPreflightPopover() {
  if (!backToPreflightVisible.value) return null;
  return html`
    <div class="back-to-preflight-popover">
      <span style="color:var(--s2a-color-content-subtle);">Navigated from Preflight</span>
      <button class="back-to-preflight-btn" onClick=${reopenPreflight}>Back to Preflight</button>
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
      ${groups.map((group) => html`<${AssetGroup} group=${group} />`)}
    </div>
    <${BackToPreflightPopover} />
  `;
}
