import { expect } from '@esm-bundle/chai';
import { html, render } from '../../../../libs/deps/htm-preact.js';
import Panel from '../../../../libs/blocks/preflight/panels/performance.js';

describe('Preflight Performance Panel', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('Panel rendering', () => {
    it('renders a panel with all the items', () => {
      render(html`<${Panel} />`, container);
      const panelItems = container.querySelectorAll('.preflight-item');
      expect(panelItems.length).to.be.greaterThan(0);
    });

    it('renders .preflight-columns container', () => {
      render(html`<${Panel} />`, container);
      expect(container.querySelector('.preflight-columns')).to.exist;
    });

    it('renders the Milo Performance Guidelines link', () => {
      render(html`<${Panel} />`, container);
      const link = container.querySelector('.performance-guidelines');
      expect(link).to.exist;
    });

    it('does not render the LCP highlight link when lcpFound is false by default', () => {
      render(html`<${Panel} />`, container);
      const lcpLink = container.querySelector('.performance-element-preview');
      // lcpFound starts false; the link should not be present until LCP is found
      expect(lcpLink).to.be.null;
    });

    it('renders two columns inside .preflight-columns', () => {
      render(html`<${Panel} />`, container);
      const cols = container.querySelectorAll('.preflight-column');
      expect(cols.length).to.equal(2);
    });

    it('renders a .lcp-tooltip-modal element', () => {
      render(html`<${Panel} />`, container);
      expect(container.querySelector('.lcp-tooltip-modal')).to.exist;
    });
  });

  describe('PerformanceItem component', () => {
    it('each .preflight-item has a .result-icon', () => {
      render(html`<${Panel} />`, container);
      const items = container.querySelectorAll('.preflight-item');
      items.forEach((item) => {
        expect(item.querySelector('.result-icon')).to.exist;
      });
    });

    it('each .preflight-item has a .preflight-item-title', () => {
      render(html`<${Panel} />`, container);
      const items = container.querySelectorAll('.preflight-item');
      items.forEach((item) => {
        expect(item.querySelector('.preflight-item-title')).to.exist;
      });
    });

    it('each .preflight-item has a .preflight-item-description', () => {
      render(html`<${Panel} />`, container);
      const items = container.querySelectorAll('.preflight-item');
      items.forEach((item) => {
        expect(item.querySelector('.preflight-item-description')).to.exist;
      });
    });
  });

  describe('Result icon states', () => {
    it('loading items show purple class on result-icon', () => {
      render(html`<${Panel} />`, container);
      const purpleIcons = container.querySelectorAll('.result-icon.purple');
      // Initially all checks are loading (purple spinner)
      expect(purpleIcons.length).to.be.greaterThan(0);
    });
  });
});
