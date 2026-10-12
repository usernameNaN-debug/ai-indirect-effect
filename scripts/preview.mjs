import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const prefix = '/ai-indirect-effect';
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.pdf':'application/pdf'};
http.createServer(async (request,response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/') { response.writeHead(302,{location:prefix+'/'}); response.end(); return; }
    if (!url.pathname.startsWith(prefix+'/')) throw new Error('Missing route');
    let name = decodeURIComponent(url.pathname.slice(prefix.length));
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.'+name);
    if (!file.startsWith(root+path.sep)) throw new Error('Missing route');
    const data = await fs.readFile(file);
    response.writeHead(200,{'content-type':types[path.extname(file)] || 'application/octet-stream','cache-control':'no-store'});
    response.end(data);
  } catch { response.writeHead(404,{'content-type':'text/plain'}); response.end('Page unavailable'); }
}).listen(8766,'127.0.0.1',()=>console.log('http://127.0.0.1:8766/ai-indirect-effect/'));
