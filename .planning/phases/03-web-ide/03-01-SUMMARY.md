---
phase: 03-web-ide
plan: 01
subsystem: ui
tags: [nodejs, express, monaco-editor, esbuild, catppuccin, lua, web-ide]

requires:
  - phase: 01-environment
    provides: Love2D + love.exe path established, project directory structure
  - phase: 02-pong
    provides: projects/01-pong project as primary file tree test target

provides:
  - Express server on 0.0.0.0:3000 serving the IDE
  - REST file API (GET tree, GET file content, PUT file save)
  - Monaco Editor bundled via esbuild with Catppuccin Mocha + Latte themes
  - Full IDE HTML/CSS/JS shell (sidebar, editor, console panels)
  - Resizable panel dividers
  - Mobile tab-switching UI
  - consoleBus EventEmitter singleton for later console streaming

affects: [03-02-run-console, 03-03-lsp, 03-04-export, 05-browser-preview]

tech-stack:
  added:
    - express 4.x (HTTP server + static serving)
    - esbuild 0.25.x (Monaco bundler)
    - monaco-editor 0.52.x (code editor component)
    - ws, chokidar, archiver, ignore (depended on by later plans)
  patterns:
    - ESM modules throughout (package.json type:module)
    - esbuild IIFE bundle with globalName=MonacoIDE for browser access
    - CSS custom properties for Catppuccin palette theming
    - CSS Grid for resizable IDE panel layout

key-files:
  created:
    - ide/server.js
    - ide/routes/files.js
    - ide/lib/console-bus.js
    - ide/package.json
    - ide/build/editor-entry.mjs
    - ide/build/build.mjs
    - ide/public/index.html
    - ide/public/style.css
    - ide/public/app.js
    - .gitignore
  modified: []

key-decisions:
  - "esbuild .ttf loader + publicPath='/' resolves Monaco codicon font at runtime"
  - "editor.bundle.css emitted by esbuild alongside editor.bundle.js — both must be linked in index.html"
  - "All gitignored build artifacts: editor.bundle.js, editor.bundle.css, editor.worker.js, codicon.ttf"
  - "Path traversal prevention in files.js: resolve() + startsWith(projectRoot) check"
  - "express.text() middleware with type:'text/plain' required for PUT file save bodies"

patterns-established:
  - "Windows PowerShell bridge: all node/npm commands run via /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
  - "IDE server binds 0.0.0.0 for LAN mobile access (hard requirement)"

requirements-completed: [IDE-01, IDE-02, IDE-03, IDE-04]

duration: 7min
completed: 2026-03-12
---

# Phase 03 Plan 01: Web IDE Foundation Summary

**Express server on 0.0.0.0:3000 with Monaco Editor (Catppuccin themes), file tree REST API, resizable panel IDE shell, and mobile tab UI**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-12T04:26:03Z
- **Completed:** 2026-03-12T04:33:15Z
- **Tasks:** 3
- **Files modified:** 10 created, 1 (.gitignore)

## Accomplishments

- Node.js/Express server boots on 0.0.0.0:3000, logs local + network URLs, serves `ide/public/` statically
- File tree API returns recursive JSON of the pong project; file GET/PUT endpoints with path traversal prevention
- Monaco Editor bundled via esbuild (3.9MB IIFE) with full Catppuccin Mocha (dark) and Latte (light) token themes
- Complete IDE HTML/CSS/JS shell: top toolbar, resizable sidebar/editor/console grid, mobile 768px tab-switching UI
- Theme toggle persists to localStorage; Ctrl+S saves current file via PUT API

## Task Commits

1. **Task 1: Initialize Node.js project, Express server, and file API** — `3126227` (feat)
2. **Task 2: Bundle Monaco Editor with esbuild and Catppuccin theme** — `2382f7c` (feat)
3. **Task 3: Create IDE HTML/CSS/JS shell with file tree, editor, and mobile tabs** — `c8b94ec` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `ide/server.js` — Express server binding 0.0.0.0:port, static serving, filesRouter mount
- `ide/routes/files.js` — GET / (tree), GET /:path (read), PUT /:path (write) with traversal prevention
- `ide/lib/console-bus.js` — EventEmitter singleton for console streaming (used in Plan 02)
- `ide/package.json` — ESM project, npm scripts (start/build), all dependencies
- `ide/package-lock.json` — Lockfile for reproducible installs
- `ide/build/editor-entry.mjs` — Monaco import, MonacoEnvironment worker setup, Catppuccin theme definitions
- `ide/build/build.mjs` — esbuild script producing editor.bundle.js + editor.worker.js + copies codicon.ttf
- `ide/public/index.html` — IDE single-page shell (toolbar, mobile tabs, grid layout panels)
- `ide/public/style.css` — Catppuccin CSS variables, CSS Grid layout, resize handles, mobile responsive
- `ide/public/app.js` — Monaco init, file tree render, file open/save, theme toggle, drag resize, mobile tabs
- `.gitignore` — Excludes node_modules, ide/config.json, and all build artifacts

## Decisions Made

- **esbuild font loader:** Monaco imports a `.ttf` codicon font in its CSS. esbuild requires an explicit `loader: {'.ttf': 'file'}` plus `publicPath: '/'` to emit and reference the font correctly. The font is also copied separately for direct CSS link.
- **editor.bundle.css:** esbuild emits a separate CSS file alongside the bundle. This must be linked in `index.html` via `<link rel="stylesheet">` — otherwise Monaco icons and scrollbars render without styles.
- **express.text() middleware:** File save PUT requests send plain text bodies. Without `express.text({type: 'text/plain'})`, `req.body` is undefined.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] esbuild build failed: no loader for .ttf files**
- **Found during:** Task 2 (esbuild bundle run)
- **Issue:** Monaco's CSS imports `codicon.ttf`; esbuild does not know how to handle `.ttf` by default, causing a build error
- **Fix:** Added `loader: {'.ttf': 'file', '.woff': 'file', '.woff2': 'file'}`, `assetNames: '[name]'`, and `publicPath: '/'` to the esbuild config; also copy `codicon.ttf` to `public/` explicitly for direct CSS reference
- **Files modified:** `ide/build/build.mjs`
- **Verification:** Build completed successfully, all three output files present: `editor.bundle.js` (3.9MB), `editor.bundle.css` (130KB), `editor.worker.js` (265KB)
- **Committed in:** `2382f7c` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required fix — build could not complete without it. No scope creep.

## Issues Encountered

- PowerShell not on PATH in WSL; resolved by using full path `/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`

## User Setup Required

None — server uses `ide/config.json` (gitignored) which was pre-populated with correct paths.

To run the IDE:
```
cd C:\Users\Trynda\Desktop\Dev\Lua\ide
node server.js
```
Then open `http://localhost:3000` or `http://<network-ip>:3000` from mobile Chrome.

If bundles need rebuilding: `node build/build.mjs`

## Next Phase Readiness

- IDE shell running, file tree populated, Monaco editor loads Lua files with syntax highlighting
- `consoleBus` EventEmitter in place for Plan 02 (run/console streaming via SSE/WebSocket)
- Run/Stop/Export buttons stubbed and visible — Plan 02 will wire Run/Stop, Plan 03 will wire Export
- No blockers for Plan 02

## Self-Check: PASSED

- ide/server.js: FOUND
- ide/routes/files.js: FOUND
- ide/lib/console-bus.js: FOUND
- ide/build/editor-entry.mjs: FOUND
- ide/build/build.mjs: FOUND
- ide/public/index.html: FOUND
- ide/public/style.css: FOUND
- ide/public/app.js: FOUND
- Commit 3126227 (Task 1): FOUND
- Commit 2382f7c (Task 2): FOUND
- Commit c8b94ec (Task 3): FOUND

---
*Phase: 03-web-ide*
*Completed: 2026-03-12*
