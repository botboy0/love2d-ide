---
phase: 03-web-ide
plan: 02
subsystem: run-console
tags: [nodejs, express, chokidar, sse, love2d, process-management, live-reload]

requires:
  - phase: 03-web-ide
    plan: 01
    provides: Express server, consoleBus singleton, IDE HTML shell with Run/Stop button stubs

provides:
  - Love2D child process lifecycle: spawn, kill, isRunning
  - POST /api/run and POST /api/run/stop Express endpoints
  - GET /api/console/stream SSE endpoint streaming stdout/stderr/info/clear events
  - chokidar watcher with 350ms debounce triggering live reload on .lua changes
  - Frontend: Run/Stop wired to /api/run, console panel streams SSE output
  - Frontend: stderr error links (file.lua:N) are clickable, navigate editor to error line
  - Save-triggered reload: Ctrl+S fires /api/run immediately if game is running

affects: [03-03-lsp, 03-04-export]

tech-stack:
  added:
    - chokidar 3.x (already in package.json — now actively used)
    - Node.js child_process.spawn (Windows: shell:false, windowsHide:false)
    - Server-Sent Events (native browser EventSource API)
  patterns:
    - consoleBus EventEmitter as publish/subscribe hub between process and SSE clients
    - SSE cleanup: req.on('close') removes named function references from consoleBus
    - Error linkification: regex DocumentFragment pattern avoids innerHTML injection
    - gameRunning state flag: save-triggered reload only fires when game is active

key-files:
  created:
    - ide/lib/process-manager.js
    - ide/lib/watcher.js
    - ide/routes/run.js
    - ide/routes/console.js
  modified:
    - ide/server.js
    - ide/public/app.js
    - ide/public/style.css

key-decisions:
  - "spawn(loveExePath, [projectPath], { shell: false, windowsHide: false }) — no shell wrapper, Love2D window appears on Windows host"
  - "consoleBus.emit('clear') called in launch() before spawn so SSE clear event fires before first stdout line"
  - "SSE listener cleanup uses named function references (not arrow functions) so consoleBus.off() matches consoleBus.on()"
  - "Error linkification uses DocumentFragment + createTextNode to avoid innerHTML XSS"
  - "Save-triggered reload checks gameRunning flag — no spurious spawns when game is stopped"
  - "GET /api/run/status added (not in plan) so page load can sync Run button state with server"

requirements-completed: [IDE-05, IDE-06, IDE-07, IDE-08]

duration: 2min
completed: 2026-03-12
---

# Phase 03 Plan 02: Run / Console Summary

**Love2D process lifecycle + SSE console streaming with live reload and clickable error links**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-12T04:36:18Z
- **Completed:** 2026-03-12T04:38:19Z
- **Tasks:** 2
- **Files modified:** 4 created, 3 modified

## Accomplishments

- `process-manager.js` spawns Love2D on the Windows host, wires stdout/stderr to consoleBus, emits 'clear' on each restart, handles process error events
- `watcher.js` watches the project directory with chokidar (native NTFS events, no polling), debounces 350ms, restarts only on `.lua` changes
- `routes/run.js` exposes `POST /api/run`, `POST /api/run/stop`, `GET /api/run/status`
- `routes/console.js` SSE endpoint with named-function listener cleanup (no memory leaks on disconnect), 25-second keep-alive heartbeat
- `server.js` mounts all new routes and starts the watcher on server startup
- Frontend Run/Stop buttons make real fetch calls; status indicator reflects game state
- Console SSE renders stdout/stderr/info lines with Catppuccin class styling; clears on restart
- Error linkification converts `file.lua:N` patterns to `<a>` elements; click fetches file, opens in Monaco, navigates to line
- Ctrl+S save fires `/api/run` immediately if game was running (sub-50ms restart)

## Task Commits

1. **Task 1: Process manager, watcher, console SSE, and run/stop routes** — `9d5a741` (feat)
2. **Task 2: Wire frontend Run/Stop, console SSE, error links, save-triggered reload** — `49edb82` (feat)

## Files Created/Modified

- `ide/lib/process-manager.js` — spawn/kill/isRunning Love2D lifecycle
- `ide/lib/watcher.js` — chokidar watcher with debounce and .lua filter
- `ide/routes/run.js` — POST /api/run, POST /api/run/stop, GET /api/run/status
- `ide/routes/console.js` — SSE stream with cleanup on client disconnect
- `ide/server.js` — mounts runRouter + consoleStream, starts watcher on boot
- `ide/public/app.js` — Run/Stop handlers, SSE consumer, linkifyErrors, goToLine, save-triggered reload
- `ide/public/style.css` — .console-line.info, .error-link styles

## Decisions Made

- **spawn options:** `shell: false, windowsHide: false` — no shell wrapper ensures Love2D window appears directly on Windows host; `windowsHide: false` is required otherwise the game window is hidden.
- **Named listener references for SSE cleanup:** Arrow functions cannot be dereferenced from EventEmitter; using named functions (`onLine`, `onClear`) allows `consoleBus.off()` to clean up correctly when the browser disconnects.
- **DocumentFragment for error linkification:** Using `createTextNode` + `createElement` avoids injecting user-controlled text as raw HTML. Regex `lastIndex` is reset before each call since the RegExp is module-scoped.
- **GET /api/run/status (deviation Rule 2):** Added a status query endpoint so the page can sync `gameRunning` state on reload — without this, the Run button would always appear enabled even if Love2D was already running.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added GET /api/run/status endpoint**
- **Found during:** Task 1
- **Issue:** The plan specified POST /api/run and POST /api/run/stop but no way for the page to query whether Love2D is already running. Without this, refreshing the browser would desync the Run button state.
- **Fix:** Added `GET /api/run/status` returning `{ running: boolean }` to `routes/run.js`; frontend fetches it on page load to set initial `gameRunning` state.
- **Files modified:** `ide/routes/run.js`, `ide/public/app.js`
- **Committed in:** `9d5a741` (Task 1), `49edb82` (Task 2)

---

**Total deviations:** 1 auto-fixed (Rule 2 - Missing critical functionality)
**Impact on plan:** Additive only — no existing behavior changed.

## Next Phase Readiness

- Run/Stop/Reload cycle complete; Love2D errors visible in console with navigation
- consoleBus is active; Plan 03 (LSP) can subscribe to 'line' events for diagnostics
- chokidar watcher running; Plan 04 (Export) can hook stopWatcher before ZIP

## Self-Check: PASSED

- ide/lib/process-manager.js: FOUND
- ide/lib/watcher.js: FOUND
- ide/routes/run.js: FOUND
- ide/routes/console.js: FOUND
- ide/server.js (modified): FOUND
- ide/public/app.js (modified): FOUND
- ide/public/style.css (modified): FOUND
- Commit 9d5a741 (Task 1): FOUND
- Commit 49edb82 (Task 2): FOUND

---
*Phase: 03-web-ide*
*Completed: 2026-03-12*
