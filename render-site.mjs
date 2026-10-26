import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from './tools/katex.mjs';
import { pages as sourcePages } from './content/pages.mjs';
import { introductions, overviewLabels } from './content/introductions.mjs';
import { overviewFigure } from './scripts/overview-svg.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const order = ['home','introduction','story','work','careers','research','welfare','mathematics','model','dynamics','growth','appendix','economy'];
const storyKeys = ['introduction','story','work','careers','research','welfare'];
const mathKeys = ['mathematics','model','dynamics','growth','appendix'];
const defaultLabels = {home:'Overview',introduction:'Introduction',story:'Before filing',work:'Customer work',careers:'Careers',research:'Research',welfare:'Welfare',mathematics:'Introduction',model:'Equilibrium',dynamics:'Dynamics',growth:'RSI and growth',appendix:'Derivations',economy:'Explore the economy'};
const defaultUI = {
  siteTitle:'Indirect Effects of Frontier AI',brand:'Indirect effects of AI',story:'Story',math:'Mathematics',explore:'Explore the economy',paper:'Read the paper',contents:'Contents',close:'Close contents',skip:'Skip to content',primary:'Primary',essay:'Essay contents',navigation:'Page navigation',previous:'prev',top:'back to top',next:'next',loading:'Preparing the figure',economyLoading:'Preparing the economy',noscript:'Interactive figures use JavaScript.',fig:'Fig.',figRef:'fig.',
  storyDescription:'From a household’s tax return, we follow how customer AI changes professional work, learning, and future expertise, then how those changes interact with the research that makes AI more capable.',
  mathDescription:'We develop the equations linking customer choices, careers, and research allocation, then follow recursive self-improvement as current AI helps produce the next generation of AI.',storyButton:'Read the story',mathButton:'Explore the model'
};
const dynamicFigures = {careers:{expectations:'career-phase'},research:{'released-hours':'research-allocation'},dynamics:{feedback:'response-map','value-kernel':'wage-kernel'}};
const widgetPlacement = {careers:{section:'replacement',key:'careers',after:2},welfare:{section:'public-research',key:'welfare',after:1}};
const figureInfo = {'overview-story':[1,'introduction'],tax:[2,'story'],learning:[3,'work'],careers:[4,'careers'],'career-phase':[5,'careers'],regimes:[6,'research'],'research-allocation':[7,'research'],welfare:[8,'welfare'],'overview-math':[9,'mathematics'],'feedback-parts':[10,'dynamics'],'response-map':[11,'dynamics'],'wage-kernel':[12,'dynamics'],growth:[13,'growth'],feedback:[14,'economy']};
const oldFigureNumbers = {1:2,2:3,3:4,4:5,5:6,6:7,7:8,8:10,9:11,10:12,11:13,12:14};
const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const route = key => key === 'home' ? '/' : `/${key}/`;

export async function buildSite(options = {}) {
  const content = options.pages ?? sourcePages, intros = options.introductions ?? introductions;
  const ui = {...defaultUI,...options.ui}, labels = {...defaultLabels,...options.labels};
  const copies = options.overviewLabels ?? overviewLabels;
  const outDir = options.outDir ?? path.join(root,'dist'), basePath = options.basePath ?? '/ai-indirect-effect';
  const origin = options.origin ?? 'https://usernameNaN-debug.github.io', lang = options.lang ?? 'en', revision = options.revision ?? '20261015b';
  const pages = {...content,...intros,story:content.home,home:{title:ui.siteTitle,deck:'',sections:[]},economy:{title:ui.explore,deck:'',sections:[]}};
  const mathErrors = [];
  const attrs = key => {const number=figureInfo[key]?.[0];if(!number)throw new Error(`Missing figure ${key}`);return `id="figure-${number}" data-figure-number="${number}" style="--figure-label:'${ui.fig} ${number}. ';"`;};
  function math(tex,displayMode=false) {
    try {return katex.renderToString(tex.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'),{displayMode,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml',macros:{'\\dd':'\\mathrm d'}});}
    catch(error){mathErrors.push({tex,message:error.message});return `<code class="math-error">${esc(tex)}</code>`;}
  }
  function inline(value) {
    return value.replace(/#figure-(\d+)/g,(_,n)=>`#figure-${oldFigureNumbers[n] ?? n}`)
      .replace(/\bfig\.\s*(\d+)|图\s*(\d+)/g,(_,en,zh)=>`${ui.figRef} ${oldFigureNumbers[en??zh] ?? (en??zh)}`)
      .replace(/<a data-figure-ref="([^"]+)"><\/a>/g,(_,key)=>`<a href="${route(figureInfo[key][1])}#figure-${figureInfo[key][0]}">${ui.figRef} ${figureInfo[key][0]}</a>`)
      .replace(/\\\(([\s\S]*?)\\\)/g,(_,tex)=>math(tex));
  }
  const paragraphs = (items=[]) => items.map(p=>`<p>${inline(p)}</p>`).join('\n');
  const equation = tex => tex ? `<div class="math-display">${math(tex,true)}</div>` : '';
  const detail = block => `<details class="derivation"><summary>${esc(block.title)}</summary><div class="derivation-body">${paragraphs(block.paragraphs)}${equation(block.equation)}</div></details>`;
  function section(block,pageKey) {
    const note = typeof block.note==='string'?{text:block.note}:block.note, dynamic = dynamicFigures[pageKey]?.[block.id], placement=widgetPlacement[pageKey];
    const widgetKey = placement ? block.id===placement.section ? placement.key : null : block.widget;
    const widget = widgetKey ? `<div data-widget="${esc(widgetKey)}" ${attrs(widgetKey)}><div class="interactive-loading" aria-live="polite">${ui.loading}</div></div>` : '';
    const dyn = dynamic ? `<div data-dynamic="${dynamic}" ${attrs(dynamic)}></div>` : '';
    const overview = block.overview ? overviewFigure(block.overview,copies[block.overview],attrs(block.overview)) : '';
    const items = block.paragraphs??[], at = Math.min(block.figureAfter ?? (widget && placement ? placement.after : block.overview?2:1),items.length), media = overview || widget || dyn;
    const secondary = widget && dyn ? dyn : '';
    return `<section class="article-section" id="${esc(block.id)}"><h2>${esc(block.title)}</h2>${note?`<aside class="margin-note">${note.title?`<span class="note-title">${esc(note.title)}</span>`:''}<p>${inline(note.text)}</p></aside>`:''}${media?paragraphs(items.slice(0,at))+equation(block.equation)+media+paragraphs(items.slice(at)):paragraphs(items)+equation(block.equation)}${secondary}${(block.details??[]).map(detail).join('\n')}</section>`;
  }
  function navigation(current) {
    const sections = [[ui.story,storyKeys],[ui.math,mathKeys],[ui.explore,['economy']]].map(([part,keys])=>`<div class="rail-group"><span class="rail-label">${part}</span>${keys.map(key=>`<a class="rail-link" href="${route(key)}" ${key===current?'aria-current="page"':''}>${esc(labels[key])}</a>${key===current?`<ul class="rail-sections">${pages[key].sections.map(s=>`<li><a href="${route(key)}#${esc(s.id)}">${esc(s.title)}</a></li>`).join('')}</ul>`:''}`).join('')}</div>`).join('');
    return `${sections}<div class="rail-group"><span class="rail-label">Empirical</span><a class="rail-link" href="${route('empirical')}">The Invisible Tax Season</a></div>`;
  }
  function overview() {
    return `<main class="overview" id="article"><header class="overview-heading"><h1>${ui.siteTitle}</h1><div class="home-playground" data-playground></div><div class="overview-actions"><a class="overview-button" href="/assets/paper.pdf" target="_blank" rel="noopener">${ui.paper}</a><a class="overview-button" href="/economy/">${ui.explore}</a><a class="overview-button" href="/empirical/">Explore empirical evidence</a></div></header><div class="overview-paths"><section class="overview-card"><h2>${ui.story}</h2><p>${ui.storyDescription}</p><a class="overview-button" href="/introduction/">${ui.storyButton}</a></section><section class="overview-card"><h2>${ui.math}</h2><p>${ui.mathDescription}</p><a class="overview-button" href="/mathematics/">${ui.mathButton}</a></section></div></main>`;
  }
  function pageNavigation(key) {
    if(key==='home'||key==='economy')return '';
    const i=order.indexOf(key),prev=order[i-1],next=order[i+1];
    return `<nav class="page-navigation" aria-label="${ui.navigation}">${prev?`<a href="${route(prev)}" rel="prev">${ui.previous}</a>`:`<span aria-disabled="true">${ui.previous}</span>`}<button type="button" data-back-to-top>${ui.top}</button>${next?`<a href="${route(next)}" rel="next">${ui.next}</a>`:`<span aria-disabled="true">${ui.next}</span>`}</nav>`;
  }
  await fs.mkdir(path.join(outDir,'assets'),{recursive:true});
  for(const key of order) {
    const page=pages[key],isStory=storyKeys.includes(key), heading=`<header class="page-heading"><h1>${esc(page.title)}</h1>${page.deck?`<p class="deck">${inline(page.deck)}</p>`:''}</header>`;
    const html=`<!doctype html><html lang="${lang}" data-page="${key}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#ffffff"><title>${esc(page.title)}${key==='home'?'':` · ${ui.brand}`}</title><meta name="description" content="${esc((page.deck??'').replace(/<[^>]+>/g,''))}"><link rel="canonical" href="${origin}${basePath}${route(key)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(page.title)}"><meta property="og:url" content="${origin}${basePath}${route(key)}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/katex/katex.min.css">${['design','widgets','feedback','dynamics-figures','overview-figures',...(key==='home'?['home-playground']:[])].map(name=>`<link rel="stylesheet" href="/assets/${name}.css?v=${revision}">`).join('')}${(options.extraStyles??[]).map(href=>`<link rel="stylesheet" href="${href}">`).join('')}${(options.beforeScripts??[]).map(src=>`<script type="module" src="${src}"></script>`).join('')}<script type="module" src="/assets/site.js?v=${revision}"></script></head><body data-page="${key}"><a class="skip-link" href="#article">${ui.skip}</a><header class="site-header"><div class="header-inner"><a class="brand" href="/">${ui.brand}</a><nav class="top-nav" aria-label="${ui.primary}"><a href="/introduction/" ${isStory?'aria-current="page"':''}>${ui.story}</a><a href="/mathematics/" ${mathKeys.includes(key)?'aria-current="page"':''}>${ui.math}</a><a href="/economy/" ${key==='economy'?'aria-current="page"':''}>${ui.explore}</a><a href="/empirical/">Empirical</a><a class="paper-link" href="/assets/paper.pdf" target="_blank" rel="noopener">${ui.paper}</a><button class="contents-toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="contents-dialog">${ui.contents}</button></nav></div></header>${key==='home'?overview():key==='economy'?`<main class="economy-workspace feedback-workspace" id="article"><div data-widget="feedback" data-fullscreen="true" ${attrs('feedback')}><div class="interactive-loading">${ui.economyLoading}</div></div></main>`:`<main>${heading}<div class="reading-layout"><aside class="reading-rail" aria-label="${ui.essay}">${navigation(key)}</aside><article class="article" id="article">${page.sections.map(block=>section(block,key)).join('\n')}</article></div></main>`}${pageNavigation(key)}<dialog class="contents-dialog" id="contents-dialog" aria-label="${ui.essay}"><div class="dialog-top"><span>${ui.contents}</span><button class="dialog-close" type="button" aria-label="${ui.close}">×</button></div><nav class="dialog-nav">${navigation(key)}</nav></dialog><noscript><p class="noscript-note">${ui.noscript}</p></noscript></body></html>`;
    const target=path.join(outDir,key==='home'?'':key);await fs.mkdir(target,{recursive:true});
    await fs.writeFile(path.join(target,'index.html'),html.replaceAll('href="/feedback/','href="/economy/').replace(/href="\/assets\/paper\.pdf(?=["#])/g,`href="/assets/paper.pdf?v=${revision}`).replace(/\b(href|src)="\/(?!\/)/g,`$1="${basePath}/`));
  }
  await fs.mkdir(path.join(outDir,'feedback'),{recursive:true});
  await fs.writeFile(path.join(outDir,'feedback/index.html'),`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${basePath}/economy/"><link rel="canonical" href="${origin}${basePath}/economy/"><title>${ui.explore}</title></head><body><a href="${basePath}/economy/">${ui.explore}</a></body></html>`);
  await fs.cp(path.join(root,'static','empirical'),path.join(outDir,'empirical'),{recursive:true});
  if(mathErrors.length)throw new Error(JSON.stringify(mathErrors,null,2));
  console.log(`Built ${order.length} ${lang} pages with ${mathErrors.length} equation errors.`);
  return {outDir,pages:order.length,figures:Object.keys(figureInfo).length};
}
