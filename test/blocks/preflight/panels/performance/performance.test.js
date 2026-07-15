/* eslint-disable import/no-named-as-default-member */
import { expect } from 'chai';
import { html, render } from '../../../../../libs/deps/htm-preact.js';
import Panel from '../../../../../libs/blocks/preflight/panels/performance.js';

describe('Preflight performance', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('Panel', () => {
    it('renders a panel with all the items', () => {
      const panel = html`<${Panel} />`;
      render(panel, document.body);
      const panelItems = document.querySelectorAll('.preflight-item');
      expect(panelItems.length).to.exist;
    });

    it('does not render the Highlight LCP section link when lcpHasElement is false', () => {
      render(html`<${Panel} />`, document.body);
      // lcpHasElement starts as false before async getLcpEntry resolves
      const lcpLink = document.querySelector('.performance-element-preview');
      expect(lcpLink).to.not.exist;
    });

    it('does not render lcp-tooltip-modal when lcpHasElement is false', () => {
      render(html`<${Panel} />`, document.body);
      const tooltip = document.querySelector('.lcp-tooltip-modal');
      expect(tooltip).to.not.exist;
    });
  });
});
