import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setConfig } from '../../../../libs/utils/utils.js';

const locales = {
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq.css' },
  kr: { ietf: 'ko-KR', tk: 'zfo3ouc.css' },
};
setConfig({ locales, pathname: '/' });

const body = await readFile({ path: './mocks/body.html' });
const { default: init } = await import('../../../../libs/c2/blocks/router-marquee/router-marquee.js');

const initBlock = (pathname) => {
  setConfig({ locales, pathname });
  document.body.innerHTML = body;
  const block = document.querySelector('.router-marquee');
  init(block);
  return block;
};

const getSlideCtas = (block, slideIndex, viewport = 'mobile') => {
  const vp = block.querySelector(`[data-viewport="${viewport}"]`);
  const slide = vp.querySelectorAll('.rm-slide')[slideIndex];
  return [...slide.querySelectorAll('.rm-ctas a')];
};

describe('router-marquee free trial CTAs', () => {
  ['/', '/de/creativecloud', '/jp/creativecloud'].forEach((pathname) => {
    it(`keeps free trial CTAs for non-KR pathname ${pathname}`, () => {
      const block = initBlock(pathname);
      const slideOneCtas = getSlideCtas(block, 0);
      expect(slideOneCtas.length).to.equal(2);
      expect(slideOneCtas[0].textContent).to.equal('Free trial');
      expect(slideOneCtas[0].classList.contains('rm-cta-primary')).to.be.true;
      expect(slideOneCtas[1].textContent).to.equal('Buy now');
      const slideTwoCtas = getSlideCtas(block, 1);
      expect(slideTwoCtas.length).to.equal(1);
      expect(slideTwoCtas[0].textContent).to.equal('Free trial');
    });
  });

  it('removes free trial CTAs for the KR locale', () => {
    const block = initBlock('/kr/creativecloud');
    const slideOneCtas = getSlideCtas(block, 0);
    expect(slideOneCtas.length).to.equal(1);
    expect(slideOneCtas[0].textContent).to.equal('Buy now');
  });

  it('removes the CTA container on KR when all CTAs are free trial', () => {
    const block = initBlock('/kr/creativecloud');
    const vp = block.querySelector('[data-viewport="mobile"]');
    const slideTwo = vp.querySelectorAll('.rm-slide')[1];
    expect(slideTwo.querySelector('.rm-ctas')).to.not.exist;
  });

  it('removes free trial CTAs on KR in every viewport', () => {
    const block = initBlock('/kr/creativecloud');
    const freeTrialCtas = [...block.querySelectorAll('.rm-ctas a')]
      .filter((cta) => cta.textContent.toLowerCase().includes('free'));
    expect(freeTrialCtas.length).to.equal(0);
  });

  it('keeps free trial CTAs on KR when the allow-kr-trial hash is present', () => {
    setConfig({ locales, pathname: '/kr/creativecloud' });
    document.body.innerHTML = body;
    const block = document.querySelector('.router-marquee');
    block.querySelectorAll('a[href*="free-trial"]').forEach((cta) => {
      cta.href += '#_allow-kr-trial';
    });
    init(block);
    const slideOneCtas = getSlideCtas(block, 0);
    expect(slideOneCtas.length).to.equal(2);
    expect(slideOneCtas[0].textContent).to.equal('Free trial');
    expect(slideOneCtas[0].href).to.not.include('#_allow-kr-trial');
  });
});
