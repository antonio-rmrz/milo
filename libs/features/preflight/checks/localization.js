/**
 * Localization tab — detects faulty / non-localised links.
 */

/**
 * @typedef {Object} LinkIssue
 * @property {'error'|'warning'} severity
 * @property {string} href
 * @property {string} detail
 */

/**
 * Scans all links and returns issues.
 * @returns {LinkIssue[]}
 */
export function runLocalizationChecks() {
  const issues = [];
  document.querySelectorAll('a[href]').forEach((a) => {
    const { href } = a;
    if (!href) return;
    try {
      const url = new URL(href);
      if (url.protocol === 'http:' && url.hostname !== 'localhost') {
        issues.push({ severity: 'warning', href, detail: 'Link uses HTTP instead of HTTPS.' });
      }
    } catch {
      issues.push({ severity: 'error', href, detail: 'Malformed URL.' });
    }
  });
  return issues;
}

/**
 * Builds the localization tab content.
 * @returns {HTMLElement}
 */
export function buildLocalizationContent() {
  const issues = runLocalizationChecks();
  const wrap = document.createElement('div');

  if (issues.length === 0) {
    const ok = document.createElement('p');
    ok.className = 'preflight-card-body';
    ok.textContent = 'No localization issues found.';
    wrap.appendChild(ok);
    return wrap;
  }

  issues.forEach((issue) => {
    const row = document.createElement('div');
    row.className = 'preflight-check-row';

    const label = document.createElement('div');
    label.className = 'preflight-check-row-label';
    label.textContent = issue.href;

    const detail = document.createElement('div');
    detail.className = 'preflight-check-row-detail';
    detail.textContent = issue.detail;

    row.appendChild(label);
    row.appendChild(detail);
    wrap.appendChild(row);
  });

  return wrap;
}
