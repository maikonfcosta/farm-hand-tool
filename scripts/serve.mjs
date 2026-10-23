import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const root = path.resolve('out');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(403).end();
        return;
      }
      if (!path.extname(file)) file = path.join(file, 'index.html');
      const data = await readFile(file);
      const compress =
        /\.(html|js|css|json|txt|svg|webmanifest)$/.test(file) &&
        req.headers['accept-encoding']?.includes('gzip');
      res
        .writeHead(200, {
          'Content-Type':
            types[path.extname(file)] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
          Vary: 'Accept-Encoding',
          ...(compress ? { 'Content-Encoding': 'gzip' } : {}),
        })
        .end(compress ? gzipSync(data) : data);
    } catch {
      res.writeHead(404).end('Not found');
    }
  })
  .listen(4173, '127.0.0.1');
