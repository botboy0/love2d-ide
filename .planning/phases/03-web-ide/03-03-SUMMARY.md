---
phase: 03-web-ide
plan: 03
subsystem: ide
tags: [love2d, archiver, ignore, lua-language-server, monaco-languageclient, vscode-ws-jsonrpc, websocket, lsp]

requires:
  - phase: 03-web-ide plan 01
    provides: Express server, Monaco editor, file tree, run/stop, console SSE
  - phase: 03-web-ide plan 02
    provides: Live reload, error navigation, theme toggle, mobile tabs

provides:
  - GET /api/export endpoint streaming .love ZIP file with .loveignore filtering
  - WebSocket /lsp proxy bridging browser Monaco to lua-language-server stdio
  - MonacoLanguageClient connectLsp() function in editor bundle
  - Default .loveignore for 01-pong project

affects: [04-pong, 05-deploy]

tech-stack:
  added: [archiver, ignore (already dep), vscode-ws-jsonrpc/server, monaco-languageclient, MonacoLanguageClient]
  patterns: [WebSocket LSP proxy via vscode-ws-jsonrpc forward(), .love ZIP streaming with archiver]

key-files:
  created:
    - ide/routes/export.js
    - ide/routes/lsp.js
    - projects/01-pong/.loveignore
  modified:
    - ide/server.js
    - ide/public/app.js
    - ide/build/editor-entry.mjs
    - ide/build/build.mjs
    - .gitignore

key-decisions:
  - "archiver glob filter uses ignore package to respect .loveignore patterns"
  - "vscode-ws-jsonrpc forward() handles bidirectional LSP message relay and cleanup"
  - "MonacoLanguageClient uses inline numeric error/close actions to avoid CJS/ESM import issues"
  - "esbuild asset names changed to [name]-[hash] to resolve codicon.ttf conflict between monaco-editor and @codingame/monaco-vscode-api"
  - "LSP WebSocket gracefully disabled when lsPath is empty — IDE works normally without it"
  - "http.createServer(app) refactor allows WebSocketServer to attach to the same port"

patterns-established:
  - "LSP pattern: vscode-ws-jsonrpc/server createWebSocketConnection + createServerProcess + forward() for Node.js side"
  - "LSP pattern: browser side uses toIWebSocket() adapter + WebSocketMessageReader/Writer + MonacoLanguageClient"
  - "Export pattern: archiver.glob() with ignore package filter for .loveignore-aware ZIP streaming"

requirements-completed: [IDE-09]

duration: 7min
completed: 2026-03-12
---

# Phase 03 Plan 03: Export and LSP Summary

**.love ZIP export with .loveignore support and Lua Language Server WebSocket proxy wired to Monaco editor**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-12T05:01:17Z
- **Completed:** 2026-03-12T05:08:xx Z
- **Tasks:** 2/3 complete (Task 3 is human-verify checkpoint)
- **Files modified:** 8

## Accomplishments

- GET /api/export streams a .love ZIP using archiver, filtered by .loveignore patterns
- attachLspProxy() creates /lsp WebSocket server that spawns lua-language-server and bridges messages using vscode-ws-jsonrpc
- connectLsp() in the Monaco bundle connects MonacoLanguageClient to /lsp; gracefully no-ops if LSP unavailable
- Export button in app.js now triggers a real browser download instead of a placeholder
- Build fixed to handle @codingame/monaco-vscode-api PNG/SVG assets and resolve codicon.ttf naming conflict

## Task Commits

1. **Task 1: .love export endpoint with .loveignore support** - `bd7021e` (feat)
2. **Task 2: LSP WebSocket proxy and Monaco language client** - `f285726` (feat)
3. **Task 3: End-to-end IDE verification** - awaiting human checkpoint

## Files Created/Modified

- `ide/routes/export.js` - GET /api/export: streams .love ZIP with .loveignore filtering via archiver + ignore
- `ide/routes/lsp.js` - attachLspProxy(): /lsp WebSocket proxy to lua-language-server using vscode-ws-jsonrpc
- `ide/server.js` - Added http.createServer, mounted exportRouter, calls attachLspProxy after listen
- `ide/build/editor-entry.mjs` - Added connectLsp() using MonacoLanguageClient + WebSocketMessageReader/Writer
- `ide/public/app.js` - Export button wired to /api/export; calls connectLsp() after editor init
- `ide/build/build.mjs` - Added PNG/SVG/JPG loaders; changed assetNames to [name]-[hash]
- `projects/01-pong/.loveignore` - Default ignore rules (.git, .loveignore, *.md)
- `.gitignore` - Added patterns for hashed-name codicon and opacity-background assets

## Decisions Made

- Used `archiver.glob()` with a custom `filter:` callback driven by the `ignore` package for .loveignore compliance
- Used inline numeric enum values (1, 2) for MonacoLanguageClient error/close actions to avoid CJS import issues in esbuild browser bundle
- Changed `assetNames` from `[name]` to `[name]-[hash]` after discovering two different `codicon.ttf` files from different packages conflicted
- Removed manual `copyFileSync` for codicon.ttf — esbuild file loader handles it now

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] esbuild missing PNG loader for @codingame/monaco-vscode-api**
- **Found during:** Task 2 (build step)
- **Issue:** `@codingame/monaco-vscode-api` (dependency of monaco-languageclient) contains CSS referencing a PNG file — esbuild failed with "No loader configured for .png files"
- **Fix:** Added `.png`, `.jpg`, `.svg` loaders to `build.mjs` loader config
- **Files modified:** ide/build/build.mjs
- **Verification:** Build completed successfully after fix
- **Committed in:** f285726 (Task 2 commit)

**2. [Rule 3 - Blocking] codicon.ttf output conflict between two packages**
- **Found during:** Task 2 (build step, after PNG fix)
- **Issue:** Both `monaco-editor` and `@codingame/monaco-vscode-api` include `codicon.ttf` with different content — esbuild with `assetNames: '[name]'` collided them on disk
- **Fix:** Changed `assetNames` to `[name]-[hash]` so each gets a unique filename; updated `.gitignore` to cover hashed variants
- **Files modified:** ide/build/build.mjs, .gitignore
- **Verification:** Build completed with two distinct hashed codicon files, no collision
- **Committed in:** f285726 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking)
**Impact on plan:** Both fixes required to make the LSP bundle build succeed. No scope creep.

## User Setup Required

**Lua Language Server is optional but recommended for diagnostics and autocomplete.**

To enable LSP features:
1. Download `lua-language-server` Windows binary from https://github.com/LuaLS/lua-language-server/releases (win32-x64 zip)
2. Extract to `C:\tools\lua-language-server\`
3. Set `lsPath` in `ide/config.json`:
   ```json
   "lsPath": "C:\\tools\\lua-language-server\\bin\\lua-language-server.exe"
   ```
4. Restart the IDE server

Without `lsPath`, the IDE works normally — LSP diagnostics and autocomplete are simply unavailable.

## Next Phase Readiness

- Full IDE feature set is implemented: file browsing, Monaco editor, run/stop, console, live reload, error navigation, export, LSP
- Awaiting end-to-end human verification (Task 3 checkpoint) before phase is considered complete
- Phase 04 (Pong rebuild) can begin once Task 3 is approved

---
*Phase: 03-web-ide*
*Completed: 2026-03-12*
