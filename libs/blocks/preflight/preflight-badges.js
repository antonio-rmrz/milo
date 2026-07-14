import { signal } from '../../deps/htm-preact.js';

export const badgeCounts = signal({
  General: { errors: 0, warnings: 0 },
  SEO: { errors: 0, warnings: 0 },
  Martech: { errors: 0, warnings: 0 },
  'M@S': { errors: 0, warnings: 0 },
  Accessibility: { errors: 0, warnings: 0 },
  Performance: { errors: 0, warnings: 0 },
  Assets: { errors: 0, warnings: 0 },
});

export function updateBadge(tabTitle, errors, warnings) {
  badgeCounts.value = {
    ...badgeCounts.value,
    [tabTitle]: { errors, warnings },
  };
}
