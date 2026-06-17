import { defineConfig } from 'vite';
import http from 'node:http';
import https from 'node:https';

function dynamicProxyPlugin() {
  return {
    name: 'dynamic-proxy',
    configureServer(server) {
      server.middlewares.use('/proxy', (req, res) => {
        const targetBase = req.headers['x-proxy-target'];
        if (!targetBase) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing X-Proxy-Target header' }));
          return;
        }

        let url;
        try {
          url = new URL(req.url === '/' ? '' : req.url, targetBase);
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid target URL' }));
          return;
        }

        const transport = url.protocol === 'https:' ? https : http;
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['x-proxy-target'];

        const upstream = transport.request(
          url,
          { method: req.method, headers },
          (upRes) => {
            const responseHeaders = { ...upRes.headers };
            delete responseHeaders['access-control-allow-origin'];
            responseHeaders['access-control-allow-origin'] = '*';
            res.writeHead(upRes.statusCode, responseHeaders);
            upRes.pipe(res);
          }
        );

        upstream.on('error', (err) => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });

        req.pipe(upstream);
      });
    },
  };
}

export default defineConfig({
  plugins: [dynamicProxyPlugin()],
  server: {
    allowedHosts: ["sfecquerybuilder.ndboost.com", "sfecquerybuilder.devita.co", "sfecquerybuilder.srp.gov"]
  }
});
