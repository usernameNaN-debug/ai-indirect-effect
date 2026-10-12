import { mountWidgets } from './widgets.js?v=20261013';

const dialog = document.querySelector('.contents-dialog');
const openButton = document.querySelector('.contents-toggle');
const closeButton = document.querySelector('.dialog-close');
if (dialog && openButton) {
  openButton.addEventListener('click', () => { dialog.showModal(); openButton.setAttribute('aria-expanded', 'true'); });
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
  for (const section of sections) { if (section.getBoundingClientRect().top <= 120) selected = section; else break; }
  sectionLinks.forEach(link => { const current = link.hash === `#${selected?.id}`; link.classList.toggle('active', current); if (current) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
}
addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateSection); }, {passive:true});
addEventListener('resize', updateSection, {passive:true});
updateSection();

try {
  await mountWidgets(document);
  document.documentElement.dataset.interactions = 'ready';
} catch (error) {
  console.error('Interactive figure initialization failed', error);
  document.documentElement.dataset.interactions = 'error';
  document.querySelectorAll('[data-widget]').forEach(node => {
    if (!node.querySelector('svg, canvas')) node.innerHTML = '<p class="widget-context" role="status">This figure could not load. Reload the page to try again.</p>';
  });
}
