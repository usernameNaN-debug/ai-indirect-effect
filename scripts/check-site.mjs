import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const basePath = '/ai-indirect-effect/';
const files = await fs.readdir(dist, { recursive: true });
const htmlFiles = files.filter(file => file.endsWith('.html'));
const pages = new Map(await Promise.all(htmlFiles.map(async file => [file, await fs.readFile(path.join(dist, file), 'utf8')])));
let links = 0, imports = 0;
assert.equal(pages.size, 9, 'All nine chapters must be built');
for (const [file, html] of pages) {
  assert(!html.includes('math-error'), `${file} contains an equation rendering failure`);
  assert(!/chatgpt\.site|window\.openai/i.test(html), `${file} depends on the previous host`);
  assert(!/Blake|Jianghanyuan|Mike Jiang|An interactive research essay/i.test(html), `${file} contains removed presentation copy`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file} has duplicate HTML IDs`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|data:|mailto:)/.test(value)) continue;
    const base = `https://local.test${basePath}${file === 'index.html' ? '' : path.dirname(file) + '/'}`;
    const url = new URL(value, base);
    assert(url.pathname.startsWith(basePath), `${file} escapes the project path through ${value}`);
    let target = decodeURIComponent(url.pathname).slice(basePath.length);
    if (!target || target.endsWith('/')) target += 'index.html';
    await fs.access(path.join(dist, target));
    if (url.hash && target.endsWith('.html')) {
      assert(pages.get(target)?.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file} has a missing section ${value}`);
    }
    links++;
  }
}
for (const file of files.filter(file => file.endsWith('.js'))) {
  const code = await fs.readFile(path.join(dist, file), 'utf8');
  for (const match of code.matchAll(/(?:from\s*|import\s*|new URL\()(['"])(\.\.?\/[^'"]+)\1/g)) {
    await fs.access(path.resolve(dist, path.dirname(file), match[2]));
    imports++;
  }
}
const pdf = await fs.readFile(path.join(dist, 'assets/paper.pdf'));
assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', 'Paper download must be a PDF');
console.log(`Verified ${pages.size} pages, ${links} local links and assets, ${imports} module references, and the paper download.`);
