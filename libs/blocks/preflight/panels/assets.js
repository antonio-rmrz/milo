import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';

const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
const criticalAssetFailures = signal([]);
const warningAssetFailures = signal([]);
const viewportTooSmall = signal(isViewportTooSmall());

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

function removeBackPopover() {
  document.querySelector('.preflight-back-popover')?.remove();
}

function navigateToAsset(asset) {
  const preflightEl = document.querySelector('#preflight');
  const closeBtn = preflightEl?.querySelector('.dialog-close');
  if (closeBtn) {
    closeBtn.click();
  } else if (preflightEl) {
    preflightEl.remove();
    document.querySelector('#preflight~.modal-curtain')?.remove();
    document.body.classList.remove('disable-scroll');
    document.querySelectorAll('header, main, footer').forEach((el) => el.removeAttribute('aria-disabled'));
  }

  const el = asset.element
    || document.querySelector(`img[src*="${(asset.src || '').split('/').pop()}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  removeBackPopover();

  const popover = document.createElement('div');
  popover.className = 'preflight-back-popover';
  const btn = document.createElement('button');
  btn.textContent = 'Back to Preflight';
  btn.addEventListener('click', () => {
    removeBackPopover();
    const sk = document.querySelector('aem-sidekick, helix-sidekick');
    if (sk) {
      sk.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
    }
  });
  popover.appendChild(btn);
  document.body.appendChild(popover);
}

function AssetsItem({ title, description }) {
  return html`
    <div class="assets-item">
      <p class="assets-item-title">${title}</p>
      <p class="assets-item-description">${description}</p>
    </div>`;
}

function AssetRow({ asset, isCritical }) {
  const rowClass = `preflight-asset-row${isCritical ? ' is-critical' : ''}`;
  return html`
    <div class=${rowClass} onClick=${() => navigateToAsset(asset)}
      title=${isCritical ? 'Above-the-fold asset with critical dimension issues' : 'Click to navigate to asset'}>
      ${asset.type === 'image' && html`<img class="preflight-asset-thumb" src=${asset.src} alt="" />`}
      ${asset.type !== 'image' && html`<div class="preflight-asset-thumb"></div>`}
      <div class="preflight-asset-metrics">
        <span><strong>Factor:</strong> ${asset.roundedFactor}</span>
        <span><strong>Upload:</strong> ${asset.naturalDimensions}</span>
        <span><strong>Display:</strong> ${asset.displayDimensions}</span>
        ${isCritical && html`<span class="preflight-asset-critical-label">Critical</span>`}
      </div>
    </div>`;
}

function AssetGroup({ group }) {
  const { title, assetArray, isCritical } = group;

  if (viewportTooSmall.value) {
    return html`
      <div class="grid-heading">
        <div class="grid-toggle">${title}</div>
      </div>
      <div class="assets-image-grid">
        <div class="assets-image-grid-item full-width">Please resize your browser to at least 1200px width to run image checks</div>
      </div>
    `;
  }

  if (assetArray.value.length === 0) {
    return html`
      <div class="grid-heading">
        <div class="grid-toggle">${title}</div>
      </div>
      <div class="assets-image-grid">
        <div class="assets-image-grid-item full-width">No assets found</div>
      </div>
    `;
  }

  return html`
    <div class="grid-heading">
      <div class="grid-toggle">${title}</div>
    </div>
    <div class="assets-image-grid">
      ${assetArray.value.map((asset) => html`<${AssetRow} asset=${asset} isCritical=${!!isCritical} />`)}
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
  `;
}
