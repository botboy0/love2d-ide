import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import os from 'os';
import { filesRouter } from './routes/files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const configPath = join(__dirname, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const app = express();
const port = config.port || 3000;

// Serve static files from public/
app.use(express.static(join(__dirname, 'public')));

// Parse plain text bodies for file save
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// Mount file API
app.use('/api/files', filesRouter(config));

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

const server = app.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Love2D IDE started`);
  console.log(`  Local:   http://localhost:${port}`);
  console.log(`  Network: http://${localIP}:${port}`);
  console.log(`  Project: ${config.projectPath}`);
});

export default server;
