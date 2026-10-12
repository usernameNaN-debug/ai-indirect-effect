import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from './tools/katex.mjs';
import { pages } from './content/pages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const origin = 'https://usernameNaN-debug.github.io';
const basePath = '/ai-indirect-effect';
pages.story = pages.home;
pages.home = { title:'Indirect Effects of Frontier AI', deck:'', sections:[] };
pages.economy = { title:'Explore the economy', deck:'', sections:[] };
const order = ['home', 'story', 'work', 'careers', 'research', 'welfare', 'model', 'dynamics', 'growth', 'appendix', 'economy'];
const labels = { home: 'Overview', story:'Introduction', work: 'Customer work', careers: 'Careers', research: 'Research', welfare: 'Welfare', model: 'Equilibrium', dynamics: 'Dynamics', growth: 'Growth', appendix: 'Derivations', economy: 'Explore the economy' };
const route = key => key === 'home' ? '/' : `/${key}/`;
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const mathErrors = [];
const dynamicFigures = { careers:{expectations:'career-phase'}, research:{'released-hours':'research-allocation'}, dynamics:{feedback:'response-map','value-kernel':'wage-kernel'} };
const figureNumbers = { tax:1, learning:2, careers:3, 'career-phase':4, regimes:5, 'research-allocation':6, welfare:7, 'feedback-parts':8, 'response-map':9, 'wage-kernel':10, growth:11, feedback:12 };
function figureAttributes(key) {
  const number = figureNumbers[key];
  if (!number) throw new Error(`Missing figure number for ${key}`);
  return `id="figure-${number}" data-figure-number="${number}" style="--figure-label:'Fig. ${number}. ';"`;
}

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
function section(block, pageKey) {
  const note = typeof block.note === 'string' ? {text:block.note} : block.note;
  const dynamic = dynamicFigures[pageKey]?.[block.id];
  return `<section class="article-section" id="${esc(block.id)}"><h2>${esc(block.title)}</h2>${note ? `<aside class="margin-note">${note.title ? `<span class="note-title">${esc(note.title)}</span>` : ''}<p>${inline(note.text)}</p></aside>` : ''}${paragraphs(block.paragraphs)}${equation(block.equation)}${block.widget ? `<div data-widget="${esc(block.widget)}" ${figureAttributes(block.widget)}><div class="interactive-loading" aria-live="polite">Preparing the figure</div></div>` : ''}${(block.details ?? []).map(detail).join('\n')}${dynamic ? `<div data-dynamic="${dynamic}" ${figureAttributes(dynamic)}></div>` : ''}</section>`;
}
function navigation(current, inDialog = false) {
  return [['Story', ['story','work','careers','research','welfare']], ['Mathematics', ['model','dynamics','growth','appendix']], ['Explore', ['economy']]].map(([part, keys]) => `<div class="rail-group"><span class="rail-label">${part}</span>${keys.map(key => {
    if (!pages[key]) return '';
    return `<a class="rail-link" href="${route(key)}" ${key === current ? 'aria-current="page"' : ''}>${esc(labels[key])}</a>${key === current ? `<ul class="rail-sections">${pages[key].sections.map(s => `<li><a href="${route(key)}#${esc(s.id)}">${esc(s.title)}</a></li>`).join('')}</ul>` : ''}`;
  }).join('')}</div>`).join('');
}
function heading(page, key) {
  return `<header class="page-heading"><h1>${esc(page.title)}</h1>${page.deck ? `<p class="deck">${inline(page.deck)}</p>` : ''}</header>`;
}
function overview() {
  return `<main class="overview" id="article"><header class="overview-heading"><h1>Indirect Effects of Frontier AI</h1><div class="home-playground" data-playground></div><div class="overview-actions"><a class="overview-button" href="/assets/paper.pdf" target="_blank" rel="noopener">Read the paper</a><a class="overview-button" href="/economy/">Explore the economy</a></div></header><div class="overview-paths"><section class="overview-card"><h2>Story</h2><p>From a household’s tax return, we follow how customer AI changes the work reaching a profession, the experience through which people learn, and the value of their future expertise.</p><a class="overview-button" href="/story/">Read the story</a></section><section class="overview-card"><h2>Mathematics</h2><p>Through customer choices, private investment, and research allocation, we develop the equations that connect professional work to learning, welfare, and frontier growth.</p><a class="overview-button" href="/model/">Explore the model</a></section></div></main>`;
}
function pageNavigation(key) {
  const index = order.indexOf(key), previous = order[index - 1], next = order[index + 1];
  return `<nav class="page-navigation" aria-label="Page navigation">${previous ? `<a href="${route(previous)}" rel="prev">prev</a>` : '<span aria-disabled="true">prev</span>'}<button type="button" data-back-to-top>back to top</button>${next ? `<a href="${route(next)}" rel="next">next</a>` : '<span aria-disabled="true">next</span>'}</nav>`;
}

const image = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><text x="29" y="47" font-family="Georgia,serif" font-style="italic" font-size="51" fill="#272727" text-anchor="middle">∂</text></svg>`;
await fs.mkdir(path.join(root, 'dist/assets'), { recursive: true });
await fs.writeFile(path.join(root, 'dist/assets/favicon.svg'), image);

for (const key of order) {
  const page = pages[key];
  if (!page) continue;
  const story = ['story','work','careers','research','welfare'].includes(key);
  const html = `<!doctype html>
<html lang="en" data-page="${key}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>${esc(page.title)}${key === 'home' ? '' : ' · Indirect Effects of AI'}</title>
<meta name="description" content="${esc(page.deck.replace(/<[^>]+>/g, ''))}">
<link rel="canonical" href="${origin}${basePath}${route(key)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.deck.replace(/<[^>]+>/g, ''))}"><meta property="og:url" content="${origin}${basePath}${route(key)}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/katex/katex.min.css"><link rel="stylesheet" href="/assets/design.css?v=20261013b"><link rel="stylesheet" href="/assets/widgets.css?v=20261013b"><link rel="stylesheet" href="/assets/feedback.css?v=20261013b"><link rel="stylesheet" href="/assets/dynamics-figures.css?v=20261013b">${key === 'home' ? '<link rel="stylesheet" href="/assets/home-playground.css?v=20261013b">' : ''}
<script type="module" src="/assets/site.js?v=20261013b"></script></head><body data-page="${key}">
<a class="skip-link" href="#article">Skip to content</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="/">Indirect effects of AI</a><nav class="top-nav" aria-label="Primary"><a href="/story/" ${story ? 'aria-current="page"' : ''}>Story</a><a href="/model/" ${!story && key !== 'economy' && key !== 'home' ? 'aria-current="page"' : ''}>Mathematics</a><a href="/economy/" ${key === 'economy' ? 'aria-current="page"' : ''}>Explore the economy</a><a class="paper-link" href="/assets/paper.pdf" target="_blank" rel="noopener">Read the paper</a><button class="contents-toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="contents-dialog">Contents</button></nav></div></header>
${key === 'home' ? overview() : key === 'economy' ? `<main class="economy-workspace feedback-workspace" id="article"><div data-widget="feedback" data-fullscreen="true" ${figureAttributes('feedback')}><div class="interactive-loading">Preparing the economy</div></div></main>` : `<main>${heading(page, key)}<div class="reading-layout"><aside class="reading-rail" aria-label="Essay contents">${navigation(key)}</aside><article class="article" id="article">${page.sections.map(block=>section(block,key)).join('\n')}</article></div></main>`}
${pageNavigation(key)}
<dialog class="contents-dialog" id="contents-dialog" aria-label="Essay contents"><div class="dialog-top"><span>Contents</span><button class="dialog-close" type="button" aria-label="Close contents">×</button></div><nav class="dialog-nav">${navigation(key, true)}</nav></dialog>
<noscript><p class="noscript-note">Interactive figures use JavaScript.</p></noscript>
</body></html>`;
  const target = key === 'home' ? path.join(root, 'dist') : path.join(root, 'dist', key);
  await fs.mkdir(target, { recursive: true });
  const deployedHTML = html.replaceAll('href="/feedback/', 'href="/economy/').replace(/\b(href|src)="\/(?!\/)/g, `$1="${basePath}/`);
  await fs.writeFile(path.join(target, 'index.html'), deployedHTML);
}
await fs.mkdir(path.join(root,'dist/feedback'),{recursive:true});
await fs.writeFile(path.join(root,'dist/feedback/index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${basePath}/economy/"><link rel="canonical" href="${origin}${basePath}/economy/"><title>Explore the economy</title></head><body><a href="${basePath}/economy/">Explore the economy</a></body></html>`);
if (mathErrors.length) {
  console.error(JSON.stringify(mathErrors, null, 2));
  process.exitCode = 1;
}
console.log(`Built ${order.filter(key => pages[key]).length} research pages with ${mathErrors.length} equation errors.`);
