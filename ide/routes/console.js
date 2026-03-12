/**
 * console.js — SSE endpoint for streaming console output to the browser.
 *
 * GET /api/console/stream — Server-Sent Events stream of consoleBus events
 *
 * Exports: consoleStream (Express request handler)
 */

import { consoleBus } from '../lib/console-bus.js';

/**
 * SSE handler for /api/console/stream.
 * Streams 'line' and 'clear' events from consoleBus to the browser.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function consoleStream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Keep connection alive with a comment every 25 seconds
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  // Define handlers using named functions so we can remove them with the same reference
  function onLine(lineData) {
    res.write(`data: ${JSON.stringify(lineData)}\n\n`);
  }

  function onClear() {
    res.write(`event: clear\ndata: {}\n\n`);
  }

  consoleBus.on('line', onLine);
  consoleBus.on('clear', onClear);

  // Clean up listeners when client disconnects to prevent SSE connection leaks
  req.on('close', () => {
    clearInterval(keepAlive);
    consoleBus.off('line', onLine);
    consoleBus.off('clear', onClear);
  });
}
