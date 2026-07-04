import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

import { isLargeDisplay } from '../../../libs/utils/utils.js';
import decorateLargeDisplayImages, {
  LARGE_DISPLAY_MEDIA,
  LARGE_DISPLAY_WIDTH,
} from '../../../libs/features/large-display/large-display.js';

// window.screen.width reflects the physical screen, not the viewport, so it is
// mocked here the same way QA must mock it in DevTools on a small monitor.
const setScreenWidth = (width) => {
  Object.defineProperty(window.screen, 'width', { value: width, configurable: true });
};

const setMetadata = (content) => {
  const meta = document.createElement('meta');
  meta.name = 'large-display-images';
  meta.content = content;
  document.head.append(meta);
};

describe('large-display images', () => {
  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
  });

  afterEach(() => {
    delete window.screen.width;
    delete window.innerWidth;
    document.head.querySelector('meta[name="large-display-images"]')?.remove();
  });

  describe('isLargeDisplay', () => {
    it('returns true only for screens wider than 1920px', () => {
      setScreenWidth(2560);
      expect(isLargeDisplay()).to.be.true;
      setScreenWidth(1920);
      expect(isLargeDisplay()).to.be.false;
    });
  });

  it('upgrades renditions on a large display with metadata on', () => {
    setScreenWidth(2560);
    setMetadata('on');
    decorateLargeDisplayImages();

    const picture = document.querySelector('picture');
    const largeSources = picture.querySelectorAll(`source[media="${LARGE_DISPLAY_MEDIA}"]`);
    expect(largeSources.length).to.equal(2);
    expect(picture.firstElementChild).to.equal(largeSources[0]);
    expect(largeSources[0].type).to.equal('image/webp');
    expect(largeSources[0].srcset).to.include(`width=${LARGE_DISPLAY_WIDTH}`);
    expect(largeSources[1].type).to.equal('image/jpeg');
    expect(largeSources[1].srcset).to.include(`width=${LARGE_DISPLAY_WIDTH}`);
  });

  it('upgrades pictures without media-scoped sources', () => {
    setScreenWidth(2560);
    setMetadata('on');
    decorateLargeDisplayImages();

    const picture = document.querySelectorAll('picture')[1];
    const largeSource = picture.querySelector(`source[media="${LARGE_DISPLAY_MEDIA}"]`);
    expect(picture.firstElementChild).to.equal(largeSource);
    expect(largeSource.srcset).to.include(`width=${LARGE_DISPLAY_WIDTH}`);
  });

  it('is idempotent', () => {
    setScreenWidth(2560);
    setMetadata('on');
    decorateLargeDisplayImages();
    const decorated = document.body.innerHTML;
    decorateLargeDisplayImages();
    expect(document.body.innerHTML).to.equal(decorated);
  });

  it('upgrades bare images only when the viewport is wider than 1920px', () => {
    setScreenWidth(2560);
    setMetadata('on');
    const bareImg = document.querySelector('main > div > img');

    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true });
    decorateLargeDisplayImages();
    expect(bareImg.getAttribute('src')).to.include('width=2000');

    Object.defineProperty(window, 'innerWidth', { value: 2560, configurable: true });
    decorateLargeDisplayImages();
    expect(bareImg.getAttribute('src')).to.include(`width=${LARGE_DISPLAY_WIDTH}`);
    const pictureImg = document.querySelector('picture img');
    expect(pictureImg.getAttribute('src')).to.include('width=750');
  });

  it('does nothing on displays 1920px or narrower even with metadata on', () => {
    setScreenWidth(1920);
    setMetadata('on');
    const before = document.body.innerHTML;
    decorateLargeDisplayImages();
    expect(document.body.innerHTML).to.equal(before);
  });

  it('does nothing on a large display without the metadata flag', () => {
    setScreenWidth(2560);
    const before = document.body.innerHTML;
    decorateLargeDisplayImages();
    expect(document.body.innerHTML).to.equal(before);
  });

  it('does nothing on a large display with the metadata flag off', () => {
    setScreenWidth(2560);
    setMetadata('off');
    const before = document.body.innerHTML;
    decorateLargeDisplayImages();
    expect(document.body.innerHTML).to.equal(before);
  });
});
