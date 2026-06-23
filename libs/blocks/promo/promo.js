import { createTag, getConfig } from '../../utils/utils.js';

export default function decorate(block) {
  const div = block.firstElementChild;
  const a = block.querySelector('div > :last-child > a');
  if (a) a.classList.add('button');

  const closeButton = createTag('span', { class: 'promo-close' });
  closeButton.setAttribute('role', 'button');
  closeButton.setAttribute('tabindex', '0');
  closeButton.setAttribute('aria-label', 'Close');

  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs || codeRoot;
  const closeIcon = createTag('img', { class: 'promo-close-icon', src: `${base}/blocks/promo/close.svg`, alt: 'promo close icon' });

  const closePromo = () => {
    const section = block.closest('.section');
    section.remove();
  };

  closeButton.addEventListener('click', closePromo);

  closeButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closePromo();
    }
  });

  div.append(closeButton);
  closeButton.append(closeIcon);
}
