import express from 'express';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import os from 'os';
import { filesRouter } from './routes/files.js';
import { runRouter } from './routes/run.js';
import { consoleStream } from './routes/console.js';
import { startWatcher } from './lib/watcher.js';
import { exportRouter } from './routes/export.js';
import { attachLspProxy } from './routes/lsp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const configPath = join(__dirname, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Resolve relative projectPath against ide/ directory
config.projectPath = resolve(__dirname, config.projectPath);

const app = express();
const port = config.port || 3000;

// Expose config to routes via app.locals
app.locals.config = config;

// love.js (Emscripten) needs SharedArrayBuffer, which requires cross-origin isolation.
// Since all assets are local (no external CDN), we can set COOP/COEP on every response.
// This ensures the iframe player inherits cross-origin isolation from the parent page.
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve static files from public/
app.use(express.static(join(__dirname, 'public')));

// Parse plain text bodies for file save
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// Mount file API
app.use('/api/files', filesRouter(config));

// Mount run/stop API
app.use('/api/run', runRouter(config));

// Mount export API
app.use('/api/export', exportRouter);

// Alias for love.js player — serves the same inline export at a clean .love URL
app.use('/api/game.love', (req, res, next) => {
  req.query.inline = '1';
  next();
}, exportRouter);

// Console SSE stream
app.get('/api/console/stream', consoleStream);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    projectPath: config.projectPath,
    loveApiPath: resolve(__dirname, 'lib/love2d-api/library'),
  });
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Get local network IP for display
function getLocalIP() {
  const nets = os.networkInterfaces();
  // Prefer 192.168.x.x / 10.x.x.x LAN addresses, skip Tailscale (100.x) and WSL (172.x)
  const candidates = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        candidates.push({ name, address: net.address });
      }
    }
  }
  const lan = candidates.find(c => c.address.startsWith('192.168.') || c.address.startsWith('10.'));
  if (lan) return lan.address;
  // Fallback: first non-internal that isn't 100.x (Tailscale)
  const fallback = candidates.find(c => !c.address.startsWith('100.'));
  return fallback ? fallback.address : candidates[0]?.address || 'localhost';
}

// HTTPS-only server (SharedArrayBuffer requires secure context)
const certPath = join(__dirname, 'cert.pem');
const keyPath = join(__dirname, 'key.pem');

if (!existsSync(certPath) || !existsSync(keyPath)) {
  console.error('Missing cert.pem / key.pem — run mkcert to generate them in ide/');
  process.exit(1);
}

const sslOpts = {
  key: readFileSync(keyPath),
  cert: readFileSync(certPath),
};
const server = https.createServer(sslOpts, app);

server.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Love2D IDE started (HTTPS)`);
  console.log(`  Local:   https://localhost:${port}`);
  console.log(`  Network: https://${localIP}:${port}`);
  console.log(`  Project: ${config.projectPath}`);

  // Start file watcher for live reload
  startWatcher(config.projectPath, config.lovePath);
  console.log(`  Watcher: watching ${config.projectPath}`);

  // Attach Lua LSP WebSocket proxy
  const lsAbsPath = config.lsPath ? resolve(__dirname, config.lsPath) : '';
  attachLspProxy(server, lsAbsPath, config.projectPath);
  if (lsAbsPath) {
    console.log(`  LSP:     lua-language-server at ${lsAbsPath}`);
  }
});

export default server;
