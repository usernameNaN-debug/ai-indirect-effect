import { mountWidgets } from './widgets.js?v=20261013c';
import { mountDynamics } from './dynamics-figures.js?v=20261013c';

const dialog = document.querySelector('.contents-dialog');
const openButton = document.querySelector('.contents-toggle');
const closeButton = document.querySelector('.dialog-close');
document.querySelector('[data-back-to-top]')?.addEventListener('click', () => {
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});
if (dialog && openButton) {
  openButton.addEventListener('click', () => { dialog.showModal(); openButton.setAttribute('aria-expanded', 'true'); updateSection(); });
  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { openButton.setAttribute('aria-expanded', 'false'); openButton.focus(); });
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => dialog.close()));
}

const sectionLinks = [...document.querySelectorAll('.rail-sections a')];
const sections = [...document.querySelectorAll('.article-section')];
let frame = 0;
function updateSection() {
  frame = 0;
  let selected = sections[0];
  for (const section of sections) { if (section.getBoundingClientRect().top <= 135) selected = section; else break; }
  if (sections.length && scrollY + innerHeight >= document.documentElement.scrollHeight - 4) selected = sections.at(-1);
  sectionLinks.forEach(link => { const current = link.hash === `#${selected?.id}`; link.classList.toggle('active', current); if (current) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  document.querySelectorAll('.rail-sections').forEach(list => {
    const active = list.querySelector('a.active');
    if (!active || !list.getClientRects().length) return;
    const style = getComputedStyle(active);
    const y = active.getBoundingClientRect().top - list.getBoundingClientRect().top + parseFloat(style.paddingTop) + parseFloat(style.lineHeight) / 2 - 2;
    list.style.setProperty('--active-y', `${y}px`);
  });
}
addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateSection); }, {passive:true});
addEventListener('resize', updateSection, {passive:true});
updateSection();

try {
  await mountWidgets(document);
  await mountDynamics(document);
  const playground = document.querySelector('[data-playground]');
  if (playground) {
    const { mountPlayground } = await import('./home-playground.js?v=20261013c');
    await mountPlayground(playground);
  }
  document.documentElement.dataset.interactions = 'ready';
} catch (error) {
  console.error('Interactive figure initialization failed', error);
  document.documentElement.dataset.interactions = 'error';
  document.querySelectorAll('[data-widget]').forEach(node => {
    if (!node.querySelector('svg, canvas')) node.innerHTML = '<p class="widget-context" role="status">This figure could not load. Reload the page to try again.</p>';
  });
}
