import express from 'express';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
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

const app = express();
const port = config.port || 3000;

// Expose config to routes via app.locals
app.locals.config = config;

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

// Console SSE stream
app.get('/api/console/stream', consoleStream);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', projectPath: config.projectPath });
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Get local network IP for display
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Create HTTP server explicitly so WebSocket can attach to it
const httpServer = http.createServer(app);

httpServer.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Love2D IDE started`);
  console.log(`  Local:   http://localhost:${port}`);
  console.log(`  Network: http://${localIP}:${port}`);
  console.log(`  Project: ${config.projectPath}`);

  // Start file watcher for live reload
  startWatcher(config.projectPath, config.lovePath);
  console.log(`  Watcher: watching ${config.projectPath}`);

  // Attach Lua LSP WebSocket proxy (no-op if lsPath is not set)
  attachLspProxy(httpServer, config.lsPath);
  if (config.lsPath) {
    console.log(`  LSP:     lua-language-server at ${config.lsPath}`);
  }
});

export default httpServer;
