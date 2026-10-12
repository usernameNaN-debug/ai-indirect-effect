import { mountWidgets } from './widgets.js';

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

const progress = document.querySelector('.read-progress');
let frame = 0;
function updateProgress() {
  frame = 0;
  const article = document.querySelector('.article');
  if (!article || !progress) return;
  const start = article.offsetTop - 100;
  const distance = Math.max(1, article.offsetHeight - innerHeight + 180);
  const value = Math.max(0, Math.min(1, (scrollY - start) / distance));
  progress.style.transform = `scaleX(${value})`;
}
addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateProgress); }, { passive: true });
addEventListener('resize', updateProgress, { passive: true });
updateProgress();

const sectionLinks = [...document.querySelectorAll('.rail-sections a')];
const sections = [...document.querySelectorAll('.article-section')];
const active = new Map();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => active.set(entry.target.id, entry.isIntersecting));
    const selected = sections.find(section => active.get(section.id));
    if (!selected) return;
    sectionLinks.forEach(link => {
      const current = link.hash === `#${selected.id}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-12% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

document.querySelectorAll('.derivation').forEach(details => {
  details.addEventListener('toggle', () => {
    if (details.open && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      details.querySelector('.derivation-body')?.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
    }
    updateProgress();
  });
});

try {
  await mountWidgets(document);
  document.documentElement.dataset.interactions = 'ready';
} catch (error) {
  console.error('Interactive figure initialization failed', error);
  document.documentElement.dataset.interactions = 'error';
  document.querySelectorAll('[data-widget]').forEach(node => {
    if (!node.querySelector('svg, canvas')) node.innerHTML = '<p class="widget-context" role="status">Interactive figures are temporarily unavailable. The equations and accompanying discussion remain available below.</p>';
  });
}
