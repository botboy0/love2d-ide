/**
 * process-manager.js — Love2D child process lifecycle management.
 *
 * Exports: launch(projectPath, loveExePath), killCurrent(), isRunning()
 */

import { spawn } from 'node:child_process';
import { consoleBus } from './console-bus.js';

let currentProcess = null;

/**
 * Kill the currently running Love2D process, if any.
 */
export function killCurrent() {
  if (!currentProcess) return;
  try {
    currentProcess.kill();
  } catch (err) {
    // Process may have already exited — ignore
  }
  currentProcess = null;
}

/**
 * Launch Love2D with the given project path.
 * Uses lovec.exe (console variant) on Windows so stdout/stderr pipe correctly.
 * love.exe is a GUI subsystem app that discards stdout even with t.console=true.
 *
 * @param {string} projectPath  - Windows path to the Love2D project directory
 * @param {string} loveExePath  - Windows path to love.exe
 */
export function launch(projectPath, loveExePath) {
  killCurrent();

  // Clear console output on each new run
  consoleBus.emit('clear');

  // Use lovec.exe (console variant) for stdout/stderr piping
  const consolePath = loveExePath.replace(/love\.exe$/i, 'lovec.exe');

  const child = spawn(consolePath, [projectPath], {
    shell: false,
    windowsHide: false,
  });

  currentProcess = child;

  child.stdout.on('data', (data) => {
    const text = data.toString();
    console.log('[IDE stdout]', JSON.stringify(text));
    for (const line of text.split('\n')) {
      if (line.trim() !== '') {
        consoleBus.emit('line', { stream: 'stdout', text: line });
      }
    }
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    console.log('[IDE stderr]', JSON.stringify(text));
    for (const line of text.split('\n')) {
      if (line.trim() !== '') {
        consoleBus.emit('line', { stream: 'stderr', text: line });
      }
    }
  });

  child.on('close', (code) => {
    consoleBus.emit('line', {
      stream: 'info',
      text: `Process exited with code ${code}`,
    });
    if (currentProcess === child) {
      currentProcess = null;
    }
  });

  child.on('error', (err) => {
    consoleBus.emit('line', {
      stream: 'stderr',
      text: `Failed to start Love2D: ${err.message}`,
    });
    if (currentProcess === child) {
      currentProcess = null;
    }
  });
}

/**
 * Returns true if Love2D is currently running.
 * @returns {boolean}
 */
export function isRunning() {
  return currentProcess !== null;
}
