import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { default: init } = await import('../../../libs/blocks/gallery/gallery.js');

// Grab all gallery blocks and initialise them
const galleries = document.querySelectorAll('.gallery');
galleries.forEach((gallery) => init(gallery));

describe('Gallery block', () => {
  describe('default (3-column) gallery', () => {
    const gallery = galleries[0];

    it('renders a <ul> with class gallery-grid', () => {
      const ul = gallery.querySelector('ul.gallery-grid');
      expect(ul).to.exist;
    });

    it('renders <li> items for each image cell', () => {
      const items = gallery.querySelectorAll('li.gallery-item');
      // 3 cells in row 1 + 1 cell in row 2 = 4 items
      expect(items.length).to.equal(4);
    });

    it('each <li> contains a <figure>', () => {
      gallery.querySelectorAll('li.gallery-item').forEach((li) => {
        expect(li.querySelector('figure.gallery-figure')).to.exist;
      });
    });

    it('each <figure> contains an <img>', () => {
      gallery.querySelectorAll('figure.gallery-figure').forEach((fig) => {
        expect(fig.querySelector('img')).to.exist;
      });
    });

    it('images have loading="lazy"', () => {
      gallery.querySelectorAll('img').forEach((img) => {
        expect(img.getAttribute('loading')).to.equal('lazy');
      });
    });

    it('images retain their original alt text', () => {
      const imgs = gallery.querySelectorAll('img');
      expect(imgs[0].alt).to.equal('A red sunset over the ocean');
      expect(imgs[1].alt).to.equal('Green forest path');
      expect(imgs[2].alt).to.equal('Snow-capped mountain');
      expect(imgs[3].alt).to.equal('City skyline at night');
    });

    it('renders a <figcaption> when caption text is present', () => {
      const items = gallery.querySelectorAll('li.gallery-item');
      // item 0 has caption "Red sunset"
      const caption0 = items[0].querySelector('figcaption.gallery-caption');
      expect(caption0).to.exist;
      expect(caption0.textContent.trim()).to.include('Red sunset');
    });

    it('does NOT render a <figcaption> when no caption text is present', () => {
      const items = gallery.querySelectorAll('li.gallery-item');
      // item 1 has no caption
      const caption1 = items[1].querySelector('figcaption.gallery-caption');
      expect(caption1).to.not.exist;
    });

    it('each gallery item has tabIndex=0 for keyboard accessibility', () => {
      gallery.querySelectorAll('li.gallery-item').forEach((li) => {
        expect(li.tabIndex).to.equal(0);
      });
    });
  });

  describe('columns-2 variant', () => {
    const gallery = galleries[1];

    it('retains the columns-2 class', () => {
      expect(gallery.classList.contains('columns-2')).to.be.true;
    });

    it('sets --gallery-columns CSS property to 2', () => {
      expect(gallery.style.getPropertyValue('--gallery-columns')).to.equal('2');
    });

    it('renders the correct number of items', () => {
      const items = gallery.querySelectorAll('li.gallery-item');
      expect(items.length).to.equal(2);
    });

    it('renders a caption for the first item', () => {
      const caption = gallery.querySelector('li.gallery-item figcaption.gallery-caption');
      expect(caption).to.exist;
      expect(caption.textContent.trim()).to.include('Desert dunes caption');
    });
  });

  describe('columns-4 variant', () => {
    const gallery = galleries[2];

    it('retains the columns-4 class', () => {
      expect(gallery.classList.contains('columns-4')).to.be.true;
    });

    it('sets --gallery-columns CSS property to 4', () => {
      expect(gallery.style.getPropertyValue('--gallery-columns')).to.equal('4');
    });

    it('renders 4 items', () => {
      const items = gallery.querySelectorAll('li.gallery-item');
      expect(items.length).to.equal(4);
    });

    it('images retain alt text', () => {
      const imgs = gallery.querySelectorAll('img');
      expect(imgs[0].alt).to.equal('Autumn leaves');
      expect(imgs[3].alt).to.equal('Winter frost');
    });
  });

  describe('empty gallery (no image cells)', () => {
    const gallery = galleries[3];

    it('renders a gallery-grid ul', () => {
      const ul = gallery.querySelector('ul.gallery-grid');
      expect(ul).to.exist;
    });

    it('renders zero items without throwing', () => {
      const items = gallery.querySelectorAll('li.gallery-item');
      expect(items.length).to.equal(0);
    });
  });
});
