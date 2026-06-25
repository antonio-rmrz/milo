/**
 * Performance tab checks.
 * Detects LCP element and conditionally renders the highlight link.
 */

/**
 * Attempts to detect the LCP element via PerformanceObserver.
 * Resolves with the element or null after a short timeout.
 * @returns {Promise<Element|null>}
 */
export function detectLcpElement() {
  return new Promise((resolve) => {
    if (!('PerformanceObserver' in window)) { resolve(null); return; }
    let lcpEl = null;
    let settled = false;
    try {
      const obs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last?.element) lcpEl = last.element;
      });
      obs.observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => {
        if (settled) return;
        settled = true;
        try { obs.disconnect(); } catch { /* ignore */ }
        resolve(lcpEl);
      }, 500);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Builds the performance check card content.
 * @param {Element|null} lcpElement  The detected LCP element, or null.
 * @returns {HTMLElement}
 */
export function buildPerformanceContent(lcpElement) {
  const wrap = document.createElement('div');

  // LCP row
  const lcpRow = document.createElement('div');
  lcpRow.className = 'preflight-check-row';

  const lcpLabel = document.createElement('div');
  lcpLabel.className = 'preflight-check-row-label';
  lcpLabel.textContent = 'Largest Contentful Paint (LCP) element';

  const lcpDetail = document.createElement('div');
  lcpDetail.className = 'preflight-check-row-detail';

  if (lcpElement) {
    const tag = lcpElement.tagName.toLowerCase();
    const src = lcpElement.src || lcpElement.currentSrc || '';
    lcpDetail.textContent = src ? `<${tag}> — ${src}` : `<${tag}>`;

    // Highlight LCP link — only rendered when an LCP element exists
    const highlightLink = document.createElement('a');
    highlightLink.className = 'preflight-highlight-lcp';
    highlightLink.href = '#';
    highlightLink.textContent = 'Highlight LCP element';
    highlightLink.setAttribute('data-preflight-highlight-lcp', 'true');
    highlightLink.addEventListener('click', (e) => {
      e.preventDefault();
      lcpElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const prev = lcpElement.style.outline;
      lcpElement.style.outline = '3px solid #1473e6';
      setTimeout(() => { lcpElement.style.outline = prev; }, 2000);
    });
    lcpDetail.appendChild(document.createElement('br'));
    lcpDetail.appendChild(highlightLink);
  } else {
    lcpDetail.textContent = 'No LCP element detected.';
    // No highlight link rendered when lcpElement is null
  }

  lcpRow.appendChild(lcpLabel);
  lcpRow.appendChild(lcpDetail);
  wrap.appendChild(lcpRow);

  return wrap;
}
