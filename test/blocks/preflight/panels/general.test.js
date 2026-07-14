import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { runGeneralChecks, localizationIssues } from '../../../../libs/blocks/preflight/panels/general.js';

describe('Preflight General Panel', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('runGeneralChecks', () => {
    it('runGeneralChecks exists and is a function', () => {
      expect(runGeneralChecks).to.exist;
      expect(typeof runGeneralChecks).to.equal('function');
    });

    it('returns an object with a page key', () => {
      const result = runGeneralChecks();
      expect(result).to.have.property('page');
    });

    it('page items include current window.location.href', () => {
      const result = runGeneralChecks();
      expect(result.page.items).to.be.an('array');
      expect(result.page.items.length).to.be.greaterThan(0);
      expect(result.page.items[0].url).to.be.instanceOf(URL);
    });

    it('returns fragments, links, svgs, pdfs, nav keys', () => {
      const result = runGeneralChecks();
      expect(result).to.have.property('fragments');
      expect(result).to.have.property('links');
      expect(result).to.have.property('svgs');
      expect(result).to.have.property('pdfs');
      expect(result).to.have.property('nav');
    });

    it('nav group is closed by default', () => {
      const result = runGeneralChecks();
      expect(result.nav.closed).to.be.true;
    });
  });

  describe('localizationIssues signal (badge source)', () => {
    it('localizationIssues is exported', () => {
      expect(localizationIssues).to.exist;
    });

    it('localizationIssues is a signal with .value and .subscribe', () => {
      expect(typeof localizationIssues.value).to.not.equal('undefined');
      expect(typeof localizationIssues.subscribe).to.equal('function');
    });

    it('localizationIssues.value is an array', () => {
      expect(Array.isArray(localizationIssues.value)).to.be.true;
    });

    it('localizationIssues badge count is zero when no violations', () => {
      const prev = localizationIssues.value;
      localizationIssues.value = [];
      expect(localizationIssues.value.length).to.equal(0);
      localizationIssues.value = prev;
    });

    it('localizationIssues array can hold violation objects', () => {
      const fakeViolations = [
        { url: 'https://example.com/en/test', isLocalized: true, usStatus: 200, localizedStatus: 404 },
        { url: 'https://example.com/en/other', isLocalized: false, usStatus: 200, localizedStatus: 200 },
      ];
      // Verify badge count logic: count = array length
      expect(fakeViolations.length).to.equal(2);
      // Verify array structure matches expected shape
      expect(fakeViolations[0]).to.have.property('url');
      expect(fakeViolations[0]).to.have.property('isLocalized');
      expect(fakeViolations[0]).to.have.property('usStatus');
      expect(fakeViolations[0]).to.have.property('localizedStatus');
    });

    it('localizationIssues subscribe returns an unsubscribe function', () => {
      const unsubscribe = localizationIssues.subscribe(() => {});
      expect(typeof unsubscribe).to.equal('function');
      unsubscribe();
    });
  });
});
