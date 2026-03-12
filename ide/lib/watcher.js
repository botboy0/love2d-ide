/**
 * watcher.js — chokidar file watcher with debounce for live reload.
 *
 * Exports: startWatcher(projectPath, loveExePath), stopWatcher()
 */

import chokidar from 'chokidar';
import { launch } from './process-manager.js';

let watcher = null;
let debounceTimer = null;
const DEBOUNCE_MS = 350;

/**
 * Start watching the project directory for .lua file changes.
 * On change, debounce by 350ms then restart Love2D.
 *
 * @param {string} projectPath  - Windows path to the Love2D project directory
 * @param {string} loveExePath  - Windows path to love.exe
 */
export function startWatcher(projectPath, loveExePath) {
  if (watcher) {
    watcher.close();
    watcher = null;
  }

  // chokidar v3: pass the directory path string directly (no glob patterns)
  watcher = chokidar.watch(projectPath, {
    usePolling: false,   // NTFS native events on Windows
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../,  // ignore dotfiles/dotdirs
  });

  watcher.on('change', (filePath) => {
    // Only trigger restart for Lua files
    if (!filePath.endsWith('.lua')) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      launch(projectPath, loveExePath);
    }, DEBOUNCE_MS);
  });

  watcher.on('error', (err) => {
    console.error('[watcher] Error:', err.message);
  });
}

/**
 * Stop the file watcher if it is active.
 */
export function stopWatcher() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}
