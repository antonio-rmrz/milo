import { injectBackPopover } from '../components/back-popover.js';

/**
 * Collects image assets from the page.
 * @returns {Array<{el:HTMLImageElement, src:string, alt:string, width:number, height:number, naturalWidth:number, naturalHeight:number}>}
 */
export function collectAssets() {
  return Array.from(document.querySelectorAll('img[src]')).map((img) => ({
    el: img,
    src: img.src || img.currentSrc || '',
    alt: img.alt || '',
    width: img.width,
    height: img.height,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
  }));
}

/**
 * Builds the assets tab content.
 * @param {Function} closeModal   Closes the preflight modal.
 * @param {Function} reopenModal  Re-opens the preflight modal.
 * @returns {HTMLElement}
 */
export function buildAssetsContent(closeModal, reopenModal) {
  const assets = collectAssets();
  const wrap = document.createElement('div');

  if (assets.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'preflight-card-body';
    empty.textContent = 'No images found on this page.';
    wrap.appendChild(empty);
    return wrap;
  }

  assets.forEach((asset) => {
    const row = document.createElement('div');
    row.className = 'preflight-asset-row';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', `Navigate to image: ${asset.alt || asset.src}`);
    row.dataset.preflightAssetRow = 'true';

    // Thumbnail
    const thumb = document.createElement('img');
    thumb.className = 'preflight-asset-thumb';
    thumb.src = asset.src;
    thumb.alt = '';
    thumb.setAttribute('aria-hidden', 'true');
    row.appendChild(thumb);

    // Info
    const info = document.createElement('div');
    info.className = 'preflight-asset-info';

    const name = document.createElement('div');
    name.className = 'preflight-asset-name';
    const filename = asset.src.split('/').pop().split('?')[0] || asset.src;
    name.textContent = filename;
    info.appendChild(name);

    if (asset.alt) {
      const meta = document.createElement('div');
      meta.className = 'preflight-asset-meta';
      meta.textContent = `alt: ${asset.alt}`;
      info.appendChild(meta);
    }
    row.appendChild(info);

    // Metrics
    const metrics = document.createElement('div');
    metrics.className = 'preflight-asset-metrics';

    if (asset.naturalWidth && asset.naturalHeight) {
      const dim = document.createElement('div');
      dim.className = 'preflight-asset-metric';
      dim.innerHTML = `<div class="preflight-asset-metric-value">${asset.naturalWidth}×${asset.naturalHeight}</div><div>px</div>`;
      metrics.appendChild(dim);
    }
    row.appendChild(metrics);

    // Click-to-navigate
    function navigate() {
      closeModal();
      asset.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      injectBackPopover(reopenModal);
    }

    row.addEventListener('click', navigate);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });

    wrap.appendChild(row);
  });

  return wrap;
}
