import { EventEmitter } from 'events';

/**
 * consoleBus — singleton EventEmitter for console output streaming.
 *
 * Events:
 *   'line'  — { stream: 'stdout'|'stderr', text: string }
 *   'clear' — emitted when console should be cleared (e.g., on game restart)
 */
class ConsoleBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  /**
   * Emit a line of output from a process stream.
   * @param {'stdout'|'stderr'} stream
   * @param {string} text
   */
  writeLine(stream, text) {
    this.emit('line', { stream, text });
  }

  /**
   * Signal all listeners to clear their display.
   */
  clear() {
    this.emit('clear');
  }
}

export const consoleBus = new ConsoleBus();
