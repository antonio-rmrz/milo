import { expect } from '@esm-bundle/chai';
import preflightApi from '../../../../libs/blocks/preflight/checks/preflightApi.js';

const {
  getLcpEntry,
  checkSingleBlock,
  checkForPersonalization,
  checkLcpEl,
  checkImageSize,
  checkVideoPoster,
  checkFragments,
  checkPlaceholders,
  checkIcons,
  runChecks,
} = preflightApi.performance;

describe('Sanity Checks', () => {
  it('preflightApi.performance.getLcpEntry exists', () => {
    expect(getLcpEntry).to.exist;
  });

  it('preflightApi.performance.checkSingleBlock exists', () => {
    expect(checkSingleBlock).to.exist;
  });

  it('preflightApi.performance.checkForPersonalization exists', () => {
    expect(checkForPersonalization).to.exist;
  });

  it('preflightApi.performance.checkLcpEl exists', () => {
    expect(checkLcpEl).to.exist;
  });

  it('preflightApi.performance.checkImageSize exists', () => {
    expect(checkImageSize).to.exist;
  });

  it('preflightApi.performance.checkVideoPoster exists', () => {
    expect(checkVideoPoster).to.exist;
  });

  it('preflightApi.performance.checkFragments exists', () => {
    expect(checkFragments).to.exist;
  });

  it('preflightApi.performance.checkPlaceholders exists', () => {
    expect(checkPlaceholders).to.exist;
  });

  it('preflightApi.performance.checkIcons exists', () => {
    expect(checkIcons).to.exist;
  });

  it('preflightApi.performance.runChecks exists', () => {
    expect(runChecks).to.exist;
  });
});

describe('checkLcpEl lcpElement field', () => {
  it('returns lcpElement: null when observeLcp resolves null', async () => {
    const nullObserver = () => Promise.resolve(null);
    const result = await checkLcpEl('test-url-null-lcp-unique', document, nullObserver);
    expect(result).to.have.property('lcpElement', null);
  });

  it('returns lcpElement as the element when LCP is found', async () => {
    const mockEl = document.createElement('img');
    const section = document.createElement('div');
    section.className = 'section';
    const main = document.createElement('main');
    main.appendChild(section);
    section.appendChild(mockEl);
    document.body.appendChild(main);

    const mockLcp = { element: mockEl, url: 'https://example.com/img.jpg' };
    const stubObserver = () => Promise.resolve(mockLcp);
    const mockArea = { querySelector: (sel) => (sel === 'main > div.section' ? section : null) };

    const result = await checkLcpEl('test-url-with-lcp-unique', mockArea, stubObserver);
    expect(result.lcpElement).to.equal(mockEl);

    main.remove();
  });

  it('returns lcpElement: null when LCP element is null in entry', async () => {
    const noElObserver = () => Promise.resolve({ url: 'https://example.com/img.jpg', element: null });
    const mockArea = { querySelector: () => null };
    const result = await checkLcpEl('test-url-no-element-unique', mockArea, noElObserver);
    expect(result.lcpElement).to.equal(null);
  });
});
