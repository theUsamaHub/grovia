/* global __dirname */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};
http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.setHeader(
      'Content-Type',
      types[path.extname(file)] || 'application/octet-stream',
    );
    fs.createReadStream(file).pipe(res);
  })
  .listen(8082, '127.0.0.1', () =>
    console.log('Production preview: http://127.0.0.1:8082'),
  );
