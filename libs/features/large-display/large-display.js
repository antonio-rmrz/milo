import { getMetadata, isLargeDisplay } from '../../utils/utils.js';

export const LARGE_DISPLAY_MEDIA = '(min-width: 1921px)';
export const LARGE_DISPLAY_WIDTH = 2560;

const WIDTH_PARAM_RE = /([?&]width=)(\d+)/;

function upgradeRenditionUrl(url) {
  const match = url?.match(WIDTH_PARAM_RE);
  if (!match || parseInt(match[2], 10) >= LARGE_DISPLAY_WIDTH) return null;
  return url.replace(WIDTH_PARAM_RE, `$1${LARGE_DISPLAY_WIDTH}`);
}

function upgradePicture(picture) {
  if (picture.querySelector(`source[media="${LARGE_DISPLAY_MEDIA}"]`)) return;
  const sources = [...picture.querySelectorAll('source')];
  const withMedia = sources.filter((source) => source.getAttribute('media'));
  const anchor = picture.firstChild;
  (withMedia.length ? withMedia : sources).forEach((source) => {
    const srcset = upgradeRenditionUrl(source.getAttribute('srcset'));
    if (!srcset) return;
    const largeSource = source.cloneNode();
    largeSource.setAttribute('srcset', srcset);
    largeSource.setAttribute('media', LARGE_DISPLAY_MEDIA);
    picture.insertBefore(largeSource, anchor);
  });
}

export default function decorateLargeDisplayImages(area = document) {
  if (!isLargeDisplay() || getMetadata('large-display-images') !== 'on') return;
  area.querySelectorAll('picture').forEach(upgradePicture);
  // Bare <img> tags have no media-query mechanism, so only upgrade them when
  // the viewport itself is wider than the threshold.
  if (window.innerWidth <= 1920) return;
  [...area.querySelectorAll('img')]
    .filter((img) => !img.closest('picture'))
    .forEach((img) => {
      const src = upgradeRenditionUrl(img.getAttribute('src'));
      if (src) img.setAttribute('src', src);
    });
}
