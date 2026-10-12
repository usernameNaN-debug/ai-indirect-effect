import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from './tools/katex.mjs';
import { pages } from './content/pages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const origin = 'https://usernameNaN-debug.github.io';
const basePath = '/ai-indirect-effect';
const order = ['home', 'work', 'careers', 'research', 'welfare', 'model', 'dynamics', 'growth', 'appendix', 'feedback'];
const labels = { home: 'Introduction', work: 'Customer work', careers: 'Careers', research: 'Research', welfare: 'Welfare', model: 'Equilibrium', dynamics: 'Dynamics', growth: 'Growth', appendix: 'Derivations', feedback: 'Feedback map' };
pages.feedback = { title: 'Feedback', deck: '', sections: [] };
const route = key => key === 'home' ? '/' : `/${key}/`;
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
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
  const note = typeof block.note === 'string' ? {text:block.note} : block.note;
  return `<section class="article-section" id="${esc(block.id)}"><h2>${esc(block.title)}</h2>${note ? `<aside class="margin-note">${note.title ? `<span class="note-title">${esc(note.title)}</span>` : ''}<p>${inline(note.text)}</p></aside>` : ''}${paragraphs(block.paragraphs)}${equation(block.equation)}${block.widget ? `<div data-widget="${esc(block.widget)}"><div class="interactive-loading" aria-live="polite">Preparing the figure</div></div>` : ''}${(block.details ?? []).map(detail).join('\n')}</section>`;
}
function navigation(current, inDialog = false) {
  return [['Story', order.slice(0, 5)], ['Mathematics', order.slice(5)]].map(([part, keys]) => `<div class="rail-group"><span class="rail-label">${part}</span>${keys.map(key => {
    if (!pages[key]) return '';
    return `<a class="rail-link" href="${route(key)}" ${key === current ? 'aria-current="page"' : ''}>${esc(labels[key])}</a>${key === current ? `<ul class="rail-sections">${pages[key].sections.map(s => `<li><a href="${route(key)}#${esc(s.id)}">${esc(s.title)}</a></li>`).join('')}</ul>` : ''}`;
  }).join('')}</div>`).join('');
}
function heading(page, key) {
  return `<header class="page-heading ${key === 'home' ? 'home-heading' : ''}"><h1>${esc(page.title)}</h1>${page.deck ? `<p class="deck">${inline(page.deck)}</p>` : ''}${key === 'home' ? '<a class="pdf-button" href="/assets/paper.pdf" target="_blank" rel="noopener">Read the paper</a>' : ''}</header>`;
}

const image = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><text x="29" y="47" font-family="Georgia,serif" font-style="italic" font-size="51" fill="#272727" text-anchor="middle">∂</text></svg>`;
await fs.mkdir(path.join(root, 'dist/assets'), { recursive: true });
await fs.writeFile(path.join(root, 'dist/assets/favicon.svg'), image);

for (const key of order) {
  const page = pages[key];
  if (!page) continue;
  const story = order.indexOf(key) < 5;
  const html = `<!doctype html>
<html lang="en" data-page="${key}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>${esc(page.title)} · The Indirect Effects of AI</title>
<meta name="description" content="${esc(page.deck.replace(/<[^>]+>/g, ''))}">
<link rel="canonical" href="${origin}${basePath}${route(key)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.deck.replace(/<[^>]+>/g, ''))}"><meta property="og:url" content="${origin}${basePath}${route(key)}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/katex/katex.min.css"><link rel="stylesheet" href="/assets/design.css?v=20261013"><link rel="stylesheet" href="/assets/widgets.css?v=20261013"><link rel="stylesheet" href="/assets/feedback.css?v=20261013">
<script type="module" src="/assets/site.js?v=20261013"></script></head><body data-page="${key}">
<a class="skip-link" href="#article">Skip to the essay</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="/">Indirect effects of AI</a><nav class="top-nav" aria-label="Primary"><a href="/" ${story ? 'aria-current="page"' : ''}>Story</a><a href="/model/" ${!story && key !== 'feedback' ? 'aria-current="page"' : ''}>Mathematics</a><a href="/feedback/" ${key === 'feedback' ? 'aria-current="page"' : ''}>Feedback</a><a class="paper-link" href="/assets/paper.pdf" target="_blank" rel="noopener">Read the paper</a><button class="contents-toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="contents-dialog">Contents</button></nav></div></header>
${key === 'feedback' ? '<main class="feedback-workspace" id="article"><div data-widget="feedback" data-fullscreen="true"><div class="interactive-loading">Preparing the feedback map</div></div></main>' : `<main>${heading(page, key)}<div class="reading-layout"><aside class="reading-rail" aria-label="Essay contents">${navigation(key)}</aside><article class="article" id="article">${page.sections.map(section).join('\n')}</article></div></main>`}
<dialog class="contents-dialog" id="contents-dialog" aria-label="Essay contents"><div class="dialog-top"><span>Contents</span><button class="dialog-close" type="button" aria-label="Close contents">×</button></div><nav class="dialog-nav">${navigation(key, true)}</nav></dialog>
<noscript><p class="noscript-note">Interactive figures use JavaScript.</p></noscript>
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
