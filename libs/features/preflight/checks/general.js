/**
 * General tab checks: page metadata quality.
 * Returns an array of check result objects.
 */

/**
 * @returns {Array<{label:string, status:'error'|'warning'|'success'|'info', detail:string}>}
 */
export function runGeneralChecks() {
  const results = [];

  // Title
  const title = document.title || '';
  if (!title) {
    results.push({ label: 'Page title', status: 'error', detail: 'No <title> element found.' });
  } else if (title.length > 70) {
    results.push({ label: 'Page title', status: 'warning', detail: `Title is ${title.length} chars (recommended ≤ 70).` });
  } else {
    results.push({ label: 'Page title', status: 'success', detail: title });
  }

  // Meta description
  const desc = document.querySelector('meta[name="description"]')?.content || '';
  if (!desc) {
    results.push({ label: 'Meta description', status: 'warning', detail: 'No meta description found.' });
  } else if (desc.length > 160) {
    results.push({ label: 'Meta description', status: 'warning', detail: `Description is ${desc.length} chars (recommended ≤ 160).` });
  } else {
    results.push({ label: 'Meta description', status: 'success', detail: desc });
  }

  // Canonical
  const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
  if (!canonical) {
    results.push({ label: 'Canonical URL', status: 'warning', detail: 'No canonical link found.' });
  } else {
    results.push({ label: 'Canonical URL', status: 'success', detail: canonical });
  }

  // H1
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) {
    results.push({ label: 'H1 heading', status: 'error', detail: 'No H1 found on the page.' });
  } else if (h1s.length > 1) {
    results.push({ label: 'H1 heading', status: 'warning', detail: `${h1s.length} H1 elements found (recommended: 1).` });
  } else {
    results.push({ label: 'H1 heading', status: 'success', detail: h1s[0].textContent.trim() });
  }

  return results;
}

/**
 * Counts faulty links (broken / non-https) for badge aggregation.
 * @returns {{errors:number, warnings:number}}
 */
export function countFaultyLinks() {
  let errors = 0;
  let warnings = 0;
  document.querySelectorAll('a[href]').forEach((a) => {
    const { href } = a;
    if (!href) return;
    try {
      const url = new URL(href);
      if (url.protocol === 'http:' && url.hostname !== 'localhost') warnings += 1;
    } catch {
      errors += 1;
    }
  });
  return { errors, warnings };
}
