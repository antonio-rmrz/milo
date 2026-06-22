/*
 * Gallery Block
 * Renders a responsive image grid from authored table content.
 * Variants: columns-2, columns-4 (default: 3 columns)
 */

export default async function init(el) {
  // Determine column-count variant
  const COLUMN_VARIANTS = ['columns-2', 'columns-4'];
  COLUMN_VARIANTS.forEach((variant) => {
    if (el.classList.contains(variant)) {
      el.style.setProperty('--gallery-columns', variant.split('-')[1]);
    }
  });

  const rows = [...el.querySelectorAll(':scope > div')];

  // Build the <ul> grid
  const ul = document.createElement('ul');
  ul.className = 'gallery-grid';

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    // Each cell may contain an image and optional caption text
    cells.forEach((cell) => {
      const img = cell.querySelector('img');
      if (!img) return; // skip cells without an image

      // Preserve alt text; enforce lazy loading
      img.loading = 'lazy';

      // Collect caption text: any non-empty text node / paragraph that is NOT the picture
      const picture = img.closest('picture') || img;
      const captionParts = [];
      [...cell.childNodes].forEach((node) => {
        if (node.contains && node.contains(picture)) return;
        const text = node.textContent?.trim();
        if (text) captionParts.push(text);
      });
      // Also check sibling paragraphs that follow the picture wrapper
      [...cell.querySelectorAll('p')].forEach((p) => {
        if (!p.contains(picture)) {
          const t = p.textContent?.trim();
          if (t) captionParts.push(t);
        }
      });

      const li = document.createElement('li');
      li.className = 'gallery-item';
      li.tabIndex = 0;

      const figure = document.createElement('figure');
      figure.className = 'gallery-figure';
      figure.appendChild(picture.tagName === 'PICTURE' ? picture : img);

      if (captionParts.length) {
        const caption = document.createElement('figcaption');
        caption.className = 'gallery-caption';
        caption.textContent = [...new Set(captionParts)].join(' ');
        figure.appendChild(caption);
      }

      li.appendChild(figure);
      ul.appendChild(li);
    });
  });

  // Replace authored content with the rendered grid
  el.innerHTML = '';
  el.appendChild(ul);
}
