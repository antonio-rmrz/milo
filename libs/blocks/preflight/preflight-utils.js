import { STATUS, SEVERITY } from './checks/constants.js';

export const TABS_CONFIG = [
  { title: 'General' },
  { title: 'SEO' },
  { title: 'Martech' },
  { title: 'M@S' },
  { title: 'Accessibility' },
  { title: 'Performance' },
  { title: 'Assets' },
];

const TAB_SECTION_MAP = {
  SEO: ['seo'],
  'M@S': ['merch'],
  Accessibility: ['accessibility'],
  Performance: ['performance'],
  Assets: ['assets'],
};

const ALL_SECTIONS = ['accessibility', 'assets', 'performance', 'seo', 'structure', 'merch'];

function sectionBadge(checks) {
  const hasError = checks.some(
    (c) => c?.status === STATUS.FAIL && c?.severity === SEVERITY.CRITICAL,
  );
  if (hasError) return 'error';
  const hasWarning = checks.some(
    (c) => (c?.status === STATUS.FAIL && c?.severity === SEVERITY.WARNING)
      || c?.status === STATUS.LIMBO,
  );
  return hasWarning ? 'warning' : null;
}

export function computeBadges(results) {
  const counts = {};

  const generalChecks = ALL_SECTIONS.flatMap((s) => results?.runChecks?.[s] || []);
  counts.General = sectionBadge(generalChecks);

  Object.entries(TAB_SECTION_MAP).forEach(([tab, sections]) => {
    const checks = sections.flatMap((s) => results?.runChecks?.[s] || []);
    counts[tab] = sectionBadge(checks);
  });

  return counts;
}
