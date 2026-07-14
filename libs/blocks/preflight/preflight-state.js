import { signal } from '../../deps/htm-preact.js';

export const tabBadges = signal({});

export function setTabBadge(tab, errors, warnings) {
  tabBadges.value = { ...tabBadges.value, [tab]: { errors, warnings } };
}
