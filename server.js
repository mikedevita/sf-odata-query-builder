import express from 'express';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/proxy', (req, res) => {
  const targetBase = req.headers['x-proxy-target'];
  if (!targetBase) {
    res.status(400).json({ error: 'Missing X-Proxy-Target header' });
    return;
  }

  let url;
  try {
    url = new URL(req.url === '/' ? '' : req.url, targetBase);
  } catch {
    res.status(400).json({ error: 'Invalid target URL' });
    return;
  }

  const transport = url.protocol === 'https:' ? https : http;
  const headers = { ...req.headers };
  delete headers['host'];
  delete headers['x-proxy-target'];

  const upstream = transport.request(url, { method: req.method, headers }, (upRes) => {
    const responseHeaders = { ...upRes.headers };
    delete responseHeaders['access-control-allow-origin'];
    responseHeaders['access-control-allow-origin'] = '*';
    res.writeHead(upRes.statusCode, responseHeaders);
    upRes.pipe(res);
  });

  upstream.on('error', (err) => {
    res.status(502).json({ error: err.message });
  });

  req.pipe(upstream);
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SAP SFEC Browser running on http://0.0.0.0:${PORT}`);
});
