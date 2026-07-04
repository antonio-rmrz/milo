import { expect } from '@esm-bundle/chai';
import { setConfig, isBacom, shouldAllowKrTrial, shouldBlockFreeTrialLinks } from '../../libs/utils/utils.js';

const locales = {
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
};

const BACOM_ORIGIN = 'https://business.adobe.com';
const NON_BACOM_ORIGIN = 'https://www.adobe.com';

const setSite = (origin, pathname) => setConfig({ origin, pathname, locales });

const createFreeTrialLink = () => {
  const link = document.createElement('a');
  link.href = 'https://www.adobe.com/products/photoshop.html';
  link.textContent = 'Free Trial';
  document.body.append(link);
  return link;
};

describe('KR free-trial suppression', () => {
  describe('isBacom', () => {
    it('returns true for BACOM production', () => {
      expect(isBacom('https://business.adobe.com')).to.be.true;
    });

    it('returns true for BACOM stage', () => {
      expect(isBacom('https://business.stage.adobe.com')).to.be.true;
    });

    it('returns true for BACOM aem preview and live hosts', () => {
      expect(isBacom('https://main--bacom--adobecom.aem.page')).to.be.true;
      expect(isBacom('https://main--bacom--adobecom.aem.live')).to.be.true;
      expect(isBacom('https://feature--bacom--adobecom.aem.live')).to.be.true;
    });

    it('returns false for non-BACOM origins', () => {
      expect(isBacom('https://www.adobe.com')).to.be.false;
      expect(isBacom('https://main--milo--adobecom.aem.page')).to.be.false;
      expect(isBacom('http://localhost:2000')).to.be.false;
    });
  });

  describe('shouldAllowKrTrial', () => {
    it('allows KR trials on BACOM without the allow hash', () => {
      setSite(BACOM_ORIGIN, '/kr/products/photoshop');
      const link = createFreeTrialLink();
      expect(shouldAllowKrTrial(link, '/kr')).to.be.true;
      link.remove();
    });

    it('does not allow KR trials on non-BACOM sites without the allow hash', () => {
      setSite(NON_BACOM_ORIGIN, '/kr/products/photoshop');
      const link = createFreeTrialLink();
      expect(shouldAllowKrTrial(link, '/kr')).to.be.false;
      link.remove();
    });
  });

  describe('shouldBlockFreeTrialLinks', () => {
    it('blocks free-trial links on non-BACOM KR pages', () => {
      setSite(NON_BACOM_ORIGIN, '/kr/products/photoshop');
      const link = createFreeTrialLink();
      expect(shouldBlockFreeTrialLinks(link)).to.be.true;
      expect(document.body.contains(link)).to.be.false;
    });

    it('does not block free-trial links on BACOM KR pages', () => {
      setSite(BACOM_ORIGIN, '/kr/products/photoshop');
      const link = createFreeTrialLink();
      expect(shouldBlockFreeTrialLinks(link)).to.be.false;
      expect(document.body.contains(link)).to.be.true;
      expect(link.dataset.hideKrFreeTrial).to.be.undefined;
      link.remove();
    });

    it('does not block free-trial links on BACOM non-KR pages', () => {
      setSite(BACOM_ORIGIN, '/products/photoshop');
      const link = createFreeTrialLink();
      expect(shouldBlockFreeTrialLinks(link)).to.be.false;
      expect(document.body.contains(link)).to.be.true;
      link.remove();
    });

    it('does not block free-trial links on non-BACOM non-KR pages', () => {
      setSite(NON_BACOM_ORIGIN, '/products/photoshop');
      const link = createFreeTrialLink();
      expect(shouldBlockFreeTrialLinks(link)).to.be.false;
      expect(document.body.contains(link)).to.be.true;
      link.remove();
    });

    it('hides merch CTAs on non-BACOM KR pages but not on BACOM KR pages', () => {
      setSite(NON_BACOM_ORIGIN, '/kr/products/photoshop');
      const nonBacomCta = createFreeTrialLink();
      nonBacomCta.dataset.wcsOsi = 'osi';
      expect(shouldBlockFreeTrialLinks(nonBacomCta)).to.be.false;
      expect(nonBacomCta.dataset.hideKrFreeTrial).to.equal('true');
      nonBacomCta.remove();

      setSite(BACOM_ORIGIN, '/kr/products/photoshop');
      const bacomCta = createFreeTrialLink();
      bacomCta.dataset.wcsOsi = 'osi';
      expect(shouldBlockFreeTrialLinks(bacomCta)).to.be.false;
      expect(bacomCta.dataset.hideKrFreeTrial).to.be.undefined;
      bacomCta.remove();
    });
  });
});
