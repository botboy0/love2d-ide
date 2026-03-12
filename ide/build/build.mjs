import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

async function run() {
  console.log('Building Monaco editor worker...');
  await build({
    entryPoints: [
      join(root, 'node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
    ],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    minify: true,
    outfile: join(root, 'public/editor.worker.js'),
    logLevel: 'info',
  });
  console.log('  -> public/editor.worker.js');

  // Ensure public dir exists (esbuild handles asset copying)
  mkdirSync(join(root, 'public'), { recursive: true });

  console.log('Building Monaco editor bundle...');
  await build({
    entryPoints: [join(root, 'build/editor-entry.mjs')],
    bundle: true,
    format: 'iife',
    globalName: 'MonacoIDE',
    platform: 'browser',
    target: ['chrome90', 'firefox88'],
    minify: true,
    outfile: join(root, 'public/editor.bundle.js'),
    logLevel: 'info',
    loader: {
      '.ttf': 'file',
      '.woff': 'file',
      '.woff2': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.svg': 'file',
    },
    assetNames: '[name]-[hash]',
    publicPath: '/',
    logOverride: {
      'commonjs-variable-in-esm': 'silent',
    },
  });
  console.log('  -> public/editor.bundle.js');

  console.log('Build complete.');
}

run().catch((err) => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
