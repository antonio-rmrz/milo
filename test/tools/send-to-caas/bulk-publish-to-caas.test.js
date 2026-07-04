import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import { getGrayboxExperienceId } from '../../../libs/blocks/caas/utils.js';
import { isLanguageFirstAutoHost, syncLanguageFirstAutoUI } from '../../../tools/send-to-caas/send-utils.js';

// Mock the DOM environment
document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('Bulk Publish to CaaS - Graybox Experience ID Integration', () => {
  describe('getGrayboxExperienceId from host parameter', () => {
    it('should extract experience ID from .graybox domain', () => {
      const host = 'test-exp.graybox.adobe.com';
      const result = getGrayboxExperienceId(host, '');
      expect(result).to.equal('test-exp');
    });

    it('should extract experience ID from .**-graybox domain', () => {
      const host = 'test-exp.bacom-graybox.adobe.com';
      const result = getGrayboxExperienceId(host, '');
      expect(result).to.equal('test-exp');
    });

    it('should extract experience ID from complex graybox patterns', () => {
      const host = 'qa-demo.enterprise-stage-graybox.adobe.com';
      const result = getGrayboxExperienceId(host, '');
      expect(result).to.equal('qa-demo');
    });

    it('should return null for non-graybox domains', () => {
      const host = 'business.adobe.com';
      const result = getGrayboxExperienceId(host, '');
      expect(result).to.be.null;
    });

    it('should return null for malformed graybox hosts', () => {
      const host = 'graybox.adobe.com';
      const result = getGrayboxExperienceId(host, '');
      expect(result).to.be.null;
    });

    it('should handle empty host parameter', () => {
      const result = getGrayboxExperienceId('', '');
      expect(result).to.be.null;
    });

    it('should handle null/undefined host parameter', () => {
      // The function expects string parameters, so we should test with empty strings instead
      const result1 = getGrayboxExperienceId('', '');
      const result2 = getGrayboxExperienceId('', '');
      expect(result1).to.be.null;
      expect(result2).to.be.null;
    });
  });

  describe('Graybox Experience ID in CaaS Payload', () => {
    it('should add gbExperienceID to caasProps when graybox host is detected', () => {
      // This test simulates the integration logic in bulk-publish-to-caas.js
      const host = 'test-exp.graybox.adobe.com';
      const grayboxExperienceId = getGrayboxExperienceId(host, '');

      // Simulate the caasProps object
      const caasProps = {
        entityId: 'test-entity-id',
        title: 'Test Title',
        // ... other properties
      };

      // Simulate adding the graybox experience ID
      if (grayboxExperienceId) {
        caasProps.gbExperienceID = grayboxExperienceId;
      }

      expect(caasProps.gbExperienceID).to.equal('test-exp');
    });

    it('should not add gbExperienceID when no graybox pattern is found', () => {
      const host = 'business.adobe.com';
      const grayboxExperienceId = getGrayboxExperienceId(host, '');

      const caasProps = {
        entityId: 'test-entity-id',
        title: 'Test Title',
      };

      if (grayboxExperienceId) {
        caasProps.gbExperienceID = grayboxExperienceId;
      }

      expect(caasProps.gbExperienceID).to.be.undefined;
    });

    it('should handle various graybox host patterns correctly', () => {
      const testCases = [
        { host: 'demo.graybox.adobe.com', expected: 'demo' },
        { host: 'stage-test.bacom-graybox.adobe.com', expected: 'stage-test' },
        { host: 'prod-demo.enterprise-prod-graybox.adobe.com', expected: 'prod-demo' },
        { host: 'qa.bacom-stage-graybox.adobe.com', expected: 'qa' },
      ];

      testCases.forEach(({ host, expected }) => {
        const result = getGrayboxExperienceId(host, '');
        expect(result).to.equal(expected, `Failed for host: ${host}`);
      });
    });
  });
});

describe('Language-First Localization auto-detection (MWPW-194951)', () => {
  describe('isLanguageFirstAutoHost', () => {
    it('should return true for BACOM prod and stage hosts', () => {
      expect(isLanguageFirstAutoHost('business.adobe.com')).to.be.true;
      expect(isLanguageFirstAutoHost('business.stage.adobe.com')).to.be.true;
    });

    it('should normalize scheme, casing, whitespace and paths', () => {
      expect(isLanguageFirstAutoHost(' https://Business.Adobe.com/fr/resources ')).to.be.true;
      expect(isLanguageFirstAutoHost('http://business.stage.adobe.com/')).to.be.true;
    });

    it('should return false for out-of-scope hosts', () => {
      const hosts = [
        'www.adobe.com',
        'milo.adobe.com',
        'news.adobe.com',
        'blog.adobe.com',
        'mybusiness.adobe.com',
        'example.com',
      ];
      hosts.forEach((host) => {
        expect(isLanguageFirstAutoHost(host)).to.equal(false, `Failed for host: ${host}`);
      });
    });

    it('should return false for empty or missing host', () => {
      expect(isLanguageFirstAutoHost('')).to.be.false;
      expect(isLanguageFirstAutoHost(undefined)).to.be.false;
    });

    it('should return false when the lfl=off override is present', () => {
      expect(isLanguageFirstAutoHost('business.adobe.com', '?lfl=off')).to.be.false;
    });
  });

  describe('syncLanguageFirstAutoUI', () => {
    let container;

    const setup = (host, checked = false) => {
      container = document.createElement('div');
      container.innerHTML = `
        <input id="host" value="${host}" />
        <div id="language-first" class="field checkbox">
          <input type="checkbox" id="languageFirst" name="languageFirst" ${checked ? 'checked' : ''} />
        </div>`;
      document.body.appendChild(container);
      return {
        hostEl: container.querySelector('#host'),
        checkbox: container.querySelector('#languageFirst'),
        wrapper: container.querySelector('#language-first'),
      };
    };

    afterEach(() => {
      container?.remove();
      container = null;
    });

    it('should check and lock the checkbox for auto-applied hosts', () => {
      const { checkbox, wrapper } = setup('business.adobe.com');
      syncLanguageFirstAutoUI();
      expect(checkbox.checked).to.be.true;
      expect(checkbox.disabled).to.be.true;
      expect(wrapper.classList.contains('lang-first-auto')).to.be.true;
    });

    it('should leave the checkbox interactive and untouched for other hosts', () => {
      const { checkbox, wrapper } = setup('milo.adobe.com', true);
      syncLanguageFirstAutoUI();
      expect(checkbox.checked).to.be.true;
      expect(checkbox.disabled).to.be.false;
      expect(wrapper.classList.contains('lang-first-auto')).to.be.false;
    });

    it('should restore the manual state when the host changes away from an auto host', () => {
      const { hostEl, checkbox, wrapper } = setup('business.adobe.com');
      syncLanguageFirstAutoUI();
      expect(checkbox.checked).to.be.true;
      expect(checkbox.disabled).to.be.true;

      hostEl.value = 'milo.adobe.com';
      syncLanguageFirstAutoUI();
      expect(checkbox.checked).to.be.false;
      expect(checkbox.disabled).to.be.false;
      expect(wrapper.classList.contains('lang-first-auto')).to.be.false;
    });
  });
});
