/**
 * run.js — Express Router for /api/run
 *
 * POST /api/run       — Launches Love2D
 * POST /api/run/stop  — Kills the running Love2D process
 *
 * Exports: runRouter (factory function receiving config)
 */

import { Router } from 'express';
import { launch, killCurrent, isRunning } from '../lib/process-manager.js';

/**
 * Create and return the run router.
 * @param {{ projectPath: string, lovePath: string }} config
 * @returns {Router}
 */
export function runRouter(config) {
  const router = Router();

  // POST /api/run — launch Love2D
  router.post('/', (req, res) => {
    try {
      launch(config.projectPath, config.lovePath);
      res.json({ status: 'running' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // POST /api/run/stop — kill Love2D
  router.post('/stop', (req, res) => {
    killCurrent();
    res.json({ status: 'stopped' });
  });

  // GET /api/run/status — query running state
  router.get('/status', (req, res) => {
    res.json({ running: isRunning() });
  });

  return router;
}
