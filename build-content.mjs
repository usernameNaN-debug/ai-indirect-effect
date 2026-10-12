import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from './tools/katex.mjs';
import { pages } from './content/pages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const origin = 'https://usernameNaN-debug.github.io';
const basePath = '/ai-indirect-effect';
const order = ['home', 'work', 'careers', 'research', 'welfare', 'model', 'dynamics', 'growth', 'appendix'];
const labels = { home: 'Overview', work: 'Customer work', careers: 'Learning & careers', research: 'Research', welfare: 'Welfare', model: 'Equilibrium', dynamics: 'Feedback & dynamics', growth: 'Growth', appendix: 'Derivations & sources' };
const route = key => key === 'home' ? '/' : `/${key}/`;
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const companion = { home: 'model', work: 'model', careers: 'dynamics', research: 'dynamics', welfare: 'appendix', model: 'work', dynamics: 'careers', growth: 'research', appendix: 'welfare' };
const mathErrors = [];

function renderMath(tex, displayMode = false) {
  try {
    tex = tex.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
    return katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'ignore', trust: false, output: 'htmlAndMathml', macros: { '\\dd': '\\mathrm d' } });
  } catch (error) {
    mathErrors.push({ tex, message: error.message });
    return `<code class="math-error">${esc(tex)}</code>`;
  }
}
function inline(html) {
  return html.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => renderMath(tex));
}
function paragraphs(items = []) { return items.map(item => `<p>${inline(item)}</p>`).join('\n'); }
function equation(tex) { return tex ? `<div class="math-display">${renderMath(tex, true)}</div>` : ''; }
function detail(block) {
  return `<details class="derivation"><summary>${esc(block.title)}</summary><div class="derivation-body">${paragraphs(block.paragraphs)}${equation(block.equation)}</div></details>`;
}
function section(block) {
  return `<section class="article-section" id="${esc(block.id)}"><h2>${esc(block.title)}<a class="section-anchor" href="#${esc(block.id)}" aria-label="Link to ${esc(block.title)}">#</a></h2>${paragraphs(block.paragraphs)}${equation(block.equation)}${block.widget ? `<div data-widget="${esc(block.widget)}"><div class="interactive-loading" aria-live="polite">Preparing the interactive figure</div></div>` : ''}${(block.details ?? []).map(detail).join('\n')}</section>`;
}
function navigation(current, inDialog = false) {
  return [['Story', order.slice(0, 5)], ['Mathematics', order.slice(5)]].map(([part, keys]) => `<div class="rail-group"><span class="rail-label">${part}</span>${keys.map(key => {
    if (!pages[key]) return '';
    return `<a class="rail-link" href="${route(key)}" ${key === current ? 'aria-current="page"' : ''}>${esc(labels[key])}</a>${key === current ? `<ul class="rail-sections">${pages[key].sections.map(s => `<li><a href="${route(key)}#${esc(s.id)}">${esc(s.title)}</a></li>`).join('')}</ul>` : ''}`;
  }).join('')}</div>`).join('') + (inDialog ? '' : '<div class="rail-paper"><a href="/assets/paper.pdf" target="_blank" rel="noopener">Full paper <span aria-hidden="true">↗</span></a></div>');
}
function heading(page, key) {
  return `<header class="page-heading ${key === 'home' ? 'home-heading' : ''}"><h1>${esc(page.title)}</h1><p class="deck">${inline(page.deck)}</p>${key === 'home' ? '<a class="pdf-button" href="/assets/paper.pdf" target="_blank" rel="noopener">Research paper <span aria-hidden="true">↗</span></a>' : ''}</header>`;
}

function nextLinks(key) {
  const index = order.indexOf(key);
  const prev = order[index - 1], next = order[index + 1];
  const link = (k, isNext) => k && pages[k] ? `<a class="${isNext ? 'next-link' : 'previous-link'}" href="${route(k)}"><small>${isNext ? 'Continue' : 'Previous'}</small><span class="next-title">${esc(labels[k])}${isNext ? '<span class="arrow" aria-hidden="true">→</span>' : ''}</span></a>` : '<span></span>';
  return `<nav class="chapter-next" aria-label="Chapter navigation">${link(prev, false)}${link(next, true)}</nav>`;
}
const image = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fffefa"/><text x="29" y="47" font-family="Georgia,serif" font-style="italic" font-size="51" fill="#b45a3d" text-anchor="middle">∂</text></svg>`;
await fs.mkdir(path.join(root, 'dist/assets'), { recursive: true });
await fs.writeFile(path.join(root, 'dist/assets/favicon.svg'), image);

for (const key of order) {
  const page = pages[key];
  if (!page) continue;
  const story = order.indexOf(key) < 5;
  const paired = companion[key];
  const html = `<!doctype html>
<html lang="en" data-page="${key}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>${esc(page.title)} · The Indirect Effects of AI</title>
<meta name="description" content="${esc(page.deck.replace(/<[^>]+>/g, ''))}">
<link rel="canonical" href="${origin}${basePath}${route(key)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.deck.replace(/<[^>]+>/g, ''))}"><meta property="og:url" content="${origin}${basePath}${route(key)}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/katex/katex.min.css"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/widgets.css">
<script type="module" src="/assets/site.js"></script></head><body>
<a class="skip-link" href="#article">Skip to the essay</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="/"><span>Indirect effects</span></a><nav class="top-nav" aria-label="Primary"><a href="/" ${story ? 'aria-current="true"' : ''}>Story</a><a href="/model/" ${!story ? 'aria-current="true"' : ''}>Mathematics</a><a class="paper-link" href="/assets/paper.pdf" target="_blank" rel="noopener">Paper<span aria-hidden="true">↗</span></a><button class="contents-toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="contents-dialog">Contents <span aria-hidden="true">+</span></button></nav></div><div class="read-progress" aria-hidden="true"></div></header>
<main>${heading(page, key)}
${key === 'home' ? '<div class="home-visual"><div data-widget="handoff"><div class="interactive-loading">Following the customer file</div></div></div>' : ''}
<div class="reading-layout"><aside class="reading-rail" aria-label="Essay contents">${navigation(key)}</aside><article class="article" id="article">${page.sections.map(section).join('\n')}
${paired && pages[paired] ? `<div class="chapter-companion">${story ? 'Mathematical companion' : 'Back to the economic story'} <a href="${route(paired)}">${esc(labels[paired])} <span aria-hidden="true">↗</span></a></div>` : ''}
${nextLinks(key)}</article></div></main>
<footer class="site-footer"><span>The Indirect Effects of AI on Professional Work</span><div class="footer-links"><a href="/appendix/">Derivations & sources</a><a href="/assets/paper.pdf">Research paper ↗</a><a href="#">Top ↑</a></div></footer>
<dialog class="contents-dialog" id="contents-dialog" aria-label="Essay contents"><div class="dialog-top"><span>Contents</span><button class="dialog-close" type="button" aria-label="Close contents">×</button></div><nav class="dialog-nav">${navigation(key, true)}</nav></dialog>
<noscript><p class="noscript-note">The full essay and equations are available on this page. Interactive figures use JavaScript.</p></noscript>
</body></html>`;
  const target = key === 'home' ? path.join(root, 'dist') : path.join(root, 'dist', key);
  await fs.mkdir(target, { recursive: true });
  const deployedHTML = html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${basePath}/`);
  await fs.writeFile(path.join(target, 'index.html'), deployedHTML);
}
if (mathErrors.length) {
  console.error(JSON.stringify(mathErrors, null, 2));
  process.exitCode = 1;
}
console.log(`Built ${order.filter(key => pages[key]).length} research pages with ${mathErrors.length} equation errors.`);
