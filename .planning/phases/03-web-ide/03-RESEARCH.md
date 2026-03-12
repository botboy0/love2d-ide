# Phase 3: Web IDE - Research

**Researched:** 2026-03-12
**Domain:** Node.js web server + CodeMirror 6 + Lua LSP + chokidar + child_process + archiver
**Confidence:** MEDIUM-HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Panel layout**
- VS Code style: sidebar file tree left, CodeMirror editor center, console panel bottom
- Top toolbar bar with project name, Run button, Export button, and status indicators
- All panel dividers are resizable by dragging
- On mobile Chrome: tab-switching UI — show one panel at a time (files, editor, console) with tabs to switch between them

**Run behavior**
- Run button kills any existing Love2D process and relaunches fresh (kill+restart)
- Server spawns Windows `love.exe` as child process (love.exe path established in Phase 1)
- Console clears on each restart — only shows output from the current session

**Live reload**
- Editor save writes the file AND immediately triggers game restart (full process kill+restart)
- chokidar filesystem watch also detects external edits (e.g., from VS Code) and triggers restart
- Both paths coexist — editor save for instant feedback, chokidar for external edit coverage
- 300-500ms debounce with polling mode for WSL2 /mnt/c/ paths (decided in Phase 1)

**Error display**
- Love2D errors appear in console panel with file:line as clickable links
- Clicking an error link opens the file at that line in the editor
- Game process stays stopped on error — user reads error, fixes code, then manually clicks Run or saves to trigger reload (no auto-retry on error)

**Lua LSP**
- Must-have for Phase 3 — real-time syntax errors, autocomplete, and diagnostics in the editor
- Use an existing solution (e.g., LuaLS/lua-language-server with a CodeMirror language client adapter)
- Researcher should investigate available options for CodeMirror 6 + Lua LSP integration

**.love export**
- Export button in the top toolbar
- Server-side zip of the project directory, browser downloads the .love file
- Export respects a `.loveignore` file in the project root (similar to .gitignore format) for excluding files
- Browser download only — no extra files saved to project directory

**Hard requirements from Specifics**
- IDE must be accessible from mobile Chrome over WiFi — hard requirement
- Vanilla HTML/CSS/JS for v0.1 — no React/Vue framework (decided in Phase 1 context)
- Everything runs on Windows filesystem (/mnt/c/...) — WSL is only for the Node.js server and CLI
- Love2D is spawned as a Windows native process (love.exe), not inside WSL

### Claude's Discretion
- Exact CodeMirror 6 theme and keybindings
- Node.js server framework choice (Express, Koa, plain http, etc.)
- WebSocket vs SSE for real-time console streaming
- File tree component implementation details
- .loveignore parsing implementation (glob library choice)
- Mobile tab-switching UI design details
- How to wire LSP to CodeMirror (protocol adapter approach)

### Deferred Ideas (OUT OF SCOPE)
- Lua LSP with Love2D API type definitions/annotations — research what's available, but full API coverage may be a future enhancement
- In-browser game preview via love.js — Phase 5
- One-click Android deploy button — Phase 5
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| IDE-01 | Web IDE launches and is accessible over local WiFi from any browser (single-window layout: sidebar + main + bottom panels) | Express binds 0.0.0.0; VS Code-style flex layout with CSS Grid/Flexbox |
| IDE-02 | File tree panel displays project directory structure with expand/collapse | `fs.readdir` recursive API + vanilla JS tree component with expand/collapse state |
| IDE-03 | User can open files from file tree into code editor | REST GET `/api/files/:path` endpoint + CodeMirror `setState` to swap content |
| IDE-04 | Code editor panel with Lua syntax highlighting (CodeMirror 6) | `@codemirror/legacy-modes` + `StreamLanguage.define(lua)` — standard, verified pattern |
| IDE-05 | User can run Love2D game from IDE (server spawns native Love2D child process on host) | `child_process.spawn` with `wslpath -w` to convert /mnt/c paths; kill existing process first |
| IDE-06 | Console panel captures and displays Love2D stdout/stderr output in real time | SSE (`/api/console/stream`) or WebSocket; `spawn.stdout.on('data')` piped to connected clients |
| IDE-07 | Live reload: game auto-restarts when Lua files are saved (debounced) | chokidar v4/v5 with `usePolling: true`, 300-500ms debounce via `setTimeout`; both save and external edit paths |
| IDE-08 | Error display: Love2D errors parsed and shown with file:line reference | Regex on stderr output: `/([^\s]+\.lua):(\d+)/g`; clickable anchors in console DOM |
| IDE-09 | User can export (download/package) project as .love file from IDE | `archiver` npm package streams ZIP to browser response; `ignore` npm package parses `.loveignore` |
</phase_requirements>

---

## Summary

Phase 3 builds a self-contained Node.js web server that serves a single-page IDE. The frontend is vanilla HTML/CSS/JS with CodeMirror 6 as the editor — no framework, no build tool at runtime (the CM6 bundle is built once with esbuild and committed). The server provides REST endpoints for file CRUD and export, SSE or WebSocket for console streaming, and manages Love2D child process lifecycle.

The most technically non-trivial areas are: (1) spawning Windows-native `love.exe` from a WSL Node.js process with correct path conversion using `wslpath -w`, (2) wiring Lua LSP (lua-language-server) via WebSocket proxy to CodeMirror 6 using `@marimo-team/codemirror-languageserver`, and (3) reliable chokidar polling on the /mnt/c WSL cross-filesystem boundary. These are all solved problems but each has WSL-specific gotchas.

The rest of the IDE (file tree, panel layout, error link parsing, .love export) is straightforward Node.js and DOM work. Mobile tab-switching via CSS media queries is standard.

**Primary recommendation:** Express + SSE for console streaming + chokidar v4 with usePolling + `@codemirror/legacy-modes` for Lua highlighting + `@marimo-team/codemirror-languageserver` for LSP + `archiver` for .love export + `ignore` for .loveignore parsing.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | ^4.x | HTTP server, REST API, static file serving | Minimal boilerplate, widely known, no lock-in |
| ws | ^8.x | WebSocket server (for LSP proxy) | Native Node.js WebSocket; needed for LSP relay |
| chokidar | ^4.x | Filesystem watch with polling mode | Proven WSL2 workaround; v4 drops glob (use Node glob instead), CJS+ESM |
| codemirror | ^6.x | Editor core bundled to `editor.bundle.js` | Industry standard for browser code editors |
| @codemirror/legacy-modes | ^6.x | Lua syntax highlighting via StreamLanguage | Only mature Lua highlighter for CM6; officially maintained |
| @marimo-team/codemirror-languageserver | ^1.16.x | LSP client plugin for CodeMirror 6 via WebSocket | Most actively maintained CM6 LSP client (v1.16.12, Feb 2026); WebSocketTransport built-in |
| archiver | ^7.x | ZIP creation streamed directly to HTTP response | Standard Node.js zip library; streaming avoids temp files |
| ignore | ^6.x | Parse .loveignore (gitignore-format) | Used by eslint/prettier; correctly implements gitignore spec |
| esbuild | ^0.x (devDep) | Bundle CodeMirror 6 packages into single browser JS | Fastest bundler; one-shot build, output committed to repo |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lua-language-server | latest binary | Provides LSP diagnostics/autocomplete for Lua | Install as a binary on Windows; server proxies stdio over WebSocket |
| mime | ^3.x | Set correct Content-Type for file downloads | When serving .love file download |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Express | plain `http` | `http` removes a dependency but requires manual routing; Express is minimal overhead |
| SSE | WebSocket for console | SSE is simpler (plain HTTP, auto-reconnect); WebSocket needed for LSP anyway so both will be present |
| `@marimo-team/codemirror-languageserver` | `@codemirror/lsp-client` (official) | Official package exists but requires custom transport wiring; marimo fork has WebSocketTransport built-in and is more actively maintained |
| chokidar v4 | chokidar v3 | v3 is CJS-only; v4 is CJS+ESM and reduces deps; glob syntax removed in v4 (use Node glob) |
| archiver | jszip | archiver streams directly to response (no full-file buffering); jszip requires loading everything into memory |
| ignore | minimatch | `ignore` correctly implements gitignore spec; minimatch does not |

**Installation:**
```bash
# Server dependencies
npm install express ws chokidar archiver ignore

# Dev dependency (build step only)
npm install --save-dev esbuild

# CodeMirror packages (bundled by esbuild, not loaded at runtime from node_modules)
npm install codemirror @codemirror/legacy-modes @marimo-team/codemirror-languageserver
```

---

## Architecture Patterns

### Recommended Project Structure
```
ide/
├── server.js              # Express app entry point; binds 0.0.0.0:3000
├── package.json           # Dependencies
├── routes/
│   ├── files.js           # GET /api/files (tree), GET /api/files/:path (read), PUT /api/files/:path (write)
│   ├── run.js             # POST /api/run (spawn/kill love.exe), POST /api/stop
│   ├── console.js         # GET /api/console/stream (SSE endpoint)
│   ├── export.js          # GET /api/export (stream ZIP response)
│   └── lsp.js             # WebSocket proxy: browser <-> lua-language-server stdio
├── lib/
│   ├── process-manager.js # Owns love.exe ChildProcess, kill+restart, event emitter
│   ├── watcher.js         # chokidar setup, debounce, fires 'change' events
│   └── console-bus.js     # EventEmitter; process-manager writes, SSE route reads
├── public/
│   ├── index.html         # Single HTML file; loads editor.bundle.js
│   ├── editor.bundle.js   # Built by esbuild (committed); CodeMirror 6 + LSP client
│   ├── style.css          # Layout, panels, mobile tabs
│   └── app.js             # Vanilla JS: DOM wiring, file tree, panel resize, tabs
└── build/
    └── build-editor.mjs   # esbuild script to regenerate editor.bundle.js
```

### Pattern 1: SSE Console Stream

**What:** Server pushes Love2D stdout/stderr to browser as Server-Sent Events over a long-lived HTTP connection.

**When to use:** When data flows server-to-client only. SSE reconnects automatically; no WebSocket upgrade needed. This is appropriate for the console panel.

**Example:**
```javascript
// Source: Node.js docs + MDN SSE pattern
// routes/console.js
import { consoleBus } from '../lib/console-bus.js';

export function consoleStream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onLine = (line) => res.write(`data: ${JSON.stringify(line)}\n\n`);
  consoleBus.on('line', onLine);
  req.on('close', () => consoleBus.off('line', onLine));
}
```

```javascript
// public/app.js (client)
const es = new EventSource('/api/console/stream');
es.onmessage = (e) => appendToConsole(JSON.parse(e.data));
```

### Pattern 2: Process Manager (kill+restart)

**What:** A module that owns a single `ChildProcess` reference. Kill ensures no zombie processes before each launch.

**When to use:** Every Run button click and every live-reload trigger goes through this module.

**Example:**
```javascript
// Source: Node.js child_process docs
// lib/process-manager.js
import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { consoleBus } from './console-bus.js';

let currentProcess = null;

export function killCurrent() {
  if (currentProcess) {
    currentProcess.kill('SIGTERM');
    currentProcess = null;
  }
}

export function launch(projectPath) {
  killCurrent();
  consoleBus.emit('clear');

  // Convert WSL path to Windows path for love.exe
  const winPath = execSync(`wslpath -w "${projectPath}"`).toString().trim();
  const lovePath = 'C:\\Program Files\\LOVE\\love.exe'; // from Phase 1 config

  currentProcess = spawn(lovePath, [winPath], {
    shell: false,           // No shell — direct exe invocation
    windowsHide: false,     // Show the Love2D window
  });

  currentProcess.stdout.on('data', (data) => {
    consoleBus.emit('line', { stream: 'stdout', text: data.toString() });
  });
  currentProcess.stderr.on('data', (data) => {
    consoleBus.emit('line', { stream: 'stderr', text: data.toString() });
  });
  currentProcess.on('close', (code) => {
    consoleBus.emit('line', { stream: 'info', text: `Process exited (${code})` });
    currentProcess = null;
  });
}
```

**WSL path conversion note:** `wslpath -w "/mnt/c/Users/..."` converts to `C:\Users\...`. This is the correct mechanism to get a Windows-native path that love.exe can consume. `wslpath` is installed by default on all WSL distributions.

### Pattern 3: chokidar with WSL2 Polling

**What:** Watch the project directory for Lua file changes with polling enabled (required on /mnt/c paths).

**When to use:** Any filesystem on a Windows-mounted path in WSL2 (/mnt/c/...) — inotify events do not work across the 9P boundary.

**Example:**
```javascript
// Source: chokidar README + Phase 1 decision
// lib/watcher.js
import chokidar from 'chokidar';

let debounceTimer = null;

export function startWatcher(projectPath, onChanged) {
  const watcher = chokidar.watch(projectPath, {
    usePolling: true,        // Required for WSL2 /mnt/c paths
    interval: 300,           // 300ms poll interval (Phase 1 decision: 300-500ms)
    ignored: /(^|[\/\\])\../, // ignore dot files
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', (filePath) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => onChanged(filePath), 350);
  });

  return watcher;
}
```

**Note:** chokidar v4 removed glob pattern support from the watch path argument. Pass a directory path (string), not a glob. Use `path.join` to build the watch path.

### Pattern 4: .love Export with .loveignore

**What:** Stream a ZIP archive of the project to the browser, respecting a `.loveignore` filter file.

**When to use:** Export button click.

**Example:**
```javascript
// Source: archiver npm docs + ignore npm docs
// routes/export.js
import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';
import ignore from 'ignore';

export function exportLove(projectPath, projectName, req, res) {
  // Parse .loveignore if present
  const ig = ignore();
  const ignorePath = path.join(projectPath, '.loveignore');
  if (fs.existsSync(ignorePath)) {
    ig.add(fs.readFileSync(ignorePath).toString());
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${projectName}.love"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  // Walk directory, filter with ignore rules
  archive.glob('**', {
    cwd: projectPath,
    ignore: [],
    filter: (filePath) => !ig.ignores(filePath),
  });

  archive.finalize();
}
```

### Pattern 5: CodeMirror 6 Bundle (esbuild)

**What:** Build all CodeMirror 6 packages into a single `editor.bundle.js` with a global variable; commit it to the repo so the server serves static JS with no build step at runtime.

**Why:** CodeMirror 6 is ESM-only and requires bundling. The server is plain Node.js/Express, not a build-tool pipeline. Building once and committing the output is the simplest approach for vanilla HTML.

**Example (build script):**
```javascript
// build/build-editor.mjs
// Source: esbuild docs + CodeMirror bundling example
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['build/editor-entry.mjs'],
  bundle: true,
  format: 'iife',
  globalName: 'IDE',   // window.IDE exposes EditorView, etc.
  outfile: 'public/editor.bundle.js',
  minify: true,
  platform: 'browser',
  target: ['chrome90', 'firefox88'],  // Modern browsers; mobile Chrome included
});
```

```javascript
// build/editor-entry.mjs
import { EditorView, basicSetup } from 'codemirror';
import { StreamLanguage } from '@codemirror/language';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { LanguageServerClient, languageServer } from '@marimo-team/codemirror-languageserver';

export { EditorView, basicSetup, StreamLanguage, lua, LanguageServerClient, languageServer };
```

### Pattern 6: LSP WebSocket Proxy (lua-language-server)

**What:** The Express server opens a WebSocket server. When the browser client connects (via `@marimo-team/codemirror-languageserver`'s WebSocketTransport), the server spawns `lua-language-server` as a child process and proxies JSON-RPC messages between WebSocket and the process's stdio.

**When to use:** When the LSP server is a native binary (not JavaScript). lua-language-server is a native binary that communicates over stdio using LSP JSON-RPC.

**Architecture:**
```
Browser (CodeMirror + codemirror-languageserver)
  <-- WebSocket --> Node.js WSProxy (ws)
                      <-- stdio --> lua-language-server.exe (via wslpath)
```

**Key pitfall:** The `codemirror-lua` repo (arnoson/codemirror-lua) only has 7 commits, 2 stars, and a documented "Loading workspace (0/0)" bug — do not use it. The `@marimo-team/codemirror-languageserver` package is the correct LSP client.

**Example (skeleton):**
```javascript
// routes/lsp.js — WebSocket proxy for lua-language-server
import { WebSocketServer } from 'ws';
import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';

export function attachLspProxy(server) {
  const wss = new WebSocketServer({ server, path: '/lsp' });

  wss.on('connection', (ws) => {
    const lsPath = execSync('wslpath -w "/usr/local/bin/lua-language-server"')
      .toString().trim();

    const ls = spawn(lsPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });

    // Browser -> LSP
    ws.on('message', (msg) => ls.stdin.write(msg));

    // LSP -> Browser
    ls.stdout.on('data', (data) => {
      if (ws.readyState === ws.OPEN) ws.send(data);
    });

    ws.on('close', () => ls.kill());
    ls.on('exit', () => ws.close());
  });
}
```

**LSP client wiring (browser-side, in editor-entry.mjs):**
```javascript
// Source: @marimo-team/codemirror-languageserver README
import { LanguageServerClient, languageServer } from '@marimo-team/codemirror-languageserver';

const client = new LanguageServerClient({
  transport: new WebSocketTransport(`ws://${location.host}/lsp`),
  rootUri: 'file:///',
  workspaceFolders: null,
});

const lspExtension = languageServer({ client, documentUri: 'file:///main.lua' });
```

### Anti-Patterns to Avoid
- **Using `exec()` for love.exe:** `exec()` buffers output and spawns a shell. Use `spawn()` directly — it streams stdout/stderr and avoids the shell wrapper.
- **Passing /mnt/c paths directly to love.exe:** love.exe is a Windows binary and does not understand WSL paths. Always convert with `wslpath -w` first.
- **chokidar without usePolling on /mnt/c:** inotify events never fire on Windows filesystem mounts in WSL2. The watcher will appear to work but never trigger. Always set `usePolling: true`.
- **Using chokidar glob patterns (v4+):** chokidar v4 removed glob support from the watch path argument. Pass a directory path string, not `**/*.lua`.
- **Loading CodeMirror from CDN at runtime:** CM6 packages on CDNs (jsDelivr, esm.run) are unreliable or don't work due to ESM resolution issues. Always use the pre-built local bundle.
- **Using `arnoson/codemirror-lua` for LSP:** That repo has a documented "Loading workspace (0/0)" bug and only 7 commits. Use `@marimo-team/codemirror-languageserver` instead.
- **Blocking the event loop during export:** Never use synchronous fs operations during archive creation. `archiver` is streaming — let it be streaming.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| .loveignore parsing | Custom glob parser | `ignore` npm package | gitignore spec has 20+ edge cases (trailing spaces, negation, path anchoring); `ignore` handles all of them |
| ZIP file creation | Manual ZIP byte writing | `archiver` | ZIP format has local file headers, central directory, CRC32 — complex to get right; archiver is battle-tested |
| LSP client protocol | Custom JSON-RPC LSP client | `@marimo-team/codemirror-languageserver` | LSP is a complex protocol (initialization handshake, capabilities negotiation, incremental sync); hand-rolling would take weeks |
| Console streaming | Long-polling or manual chunked responses | SSE (`EventSource` / `text/event-stream`) | SSE is a browser native standard with automatic reconnect; no library needed beyond correct Content-Type header |
| File watcher debounce | Custom inotify binding | chokidar | WSL2 inotify doesn't work across 9P boundary; chokidar's polling mode is the established workaround |
| Syntax highlighting | Custom lexer for Lua | `@codemirror/legacy-modes` lua mode | Tokenizing Lua correctly (long strings, multi-line comments, nested brackets) is non-trivial |

**Key insight:** Every custom solution in this list exists specifically because the problem contains hidden complexity that only manifests at edge cases. Use the library.

---

## Common Pitfalls

### Pitfall 1: WSL Path Not Converted for love.exe
**What goes wrong:** `spawn('/mnt/c/Program Files/LOVE/love.exe', ['/mnt/c/Users/.../projects/01-pong'])` fails because love.exe is a Windows binary that cannot resolve /mnt/c paths.
**Why it happens:** Developers familiar with WSL assume paths are interchangeable. They are not for Windows-native binaries.
**How to avoid:** Always run `wslpath -w` on any /mnt/c path before passing it to a Windows executable. Store the Windows love.exe path in a config file from Phase 1 (already established).
**Warning signs:** `spawn` ENOENT or Love2D launches but immediately exits with "Cannot find project" error.

### Pitfall 2: chokidar Never Fires on /mnt/c
**What goes wrong:** File watcher set up with default settings silently receives no events when Lua files are saved.
**Why it happens:** WSL2 uses a 9P protocol server to access Windows filesystems. The kernel inotify mechanism that chokidar defaults to does not work across this boundary.
**How to avoid:** Set `usePolling: true` and `interval: 300` (or higher). This is a Phase 1 decision, already locked.
**Warning signs:** Saving a file does not trigger live reload, but `chokidar.watch(...).on('error')` shows nothing.

### Pitfall 3: chokidar v4 Glob Syntax Removed
**What goes wrong:** `chokidar.watch('/mnt/c/path/**/*.lua')` silently watches nothing in chokidar v4+.
**Why it happens:** v4 (September 2024) removed glob support from watch paths. The API change is a breaking change with no error thrown.
**How to avoid:** Pass a directory path: `chokidar.watch('/mnt/c/Users/.../projects/01-pong', { ... })`. Filter to .lua files in the change handler if needed.
**Warning signs:** Watcher set up without error, but never fires any events.

### Pitfall 4: Love2D stderr Contains Non-Error Output
**What goes wrong:** Regex for error parsing matches normal debug output or LOVE startup messages, producing spurious clickable error links.
**Why it happens:** Love2D writes some informational lines to stderr (especially on startup). The pattern `filename.lua:NNN` can appear in stack traces, normal print output piped via stderr, and actual errors.
**How to avoid:** Only linkify stderr lines that match Love2D's error pattern: lines starting with "Error" or containing a traceback prefix. The pattern is: `Error\s+(.+\.lua):(\d+):` for the primary error line. Stack trace lines match `([^\s]+\.lua):(\d+):\s+in`.
**Warning signs:** Every line in the console is a clickable link.

### Pitfall 5: SSE Connection Leaks on Page Reload
**What goes wrong:** Each browser reload creates a new EventSource connection without closing the old one. Server accumulates orphaned listeners on `consoleBus`.
**Why it happens:** The browser closes the old EventSource on reload, which fires the `request.on('close')` event — but only if the server correctly registers the close handler.
**How to avoid:** Always register `req.on('close', () => consoleBus.off('line', onLine))` immediately after `res.flushHeaders()`. Confirm in the handler that `onLine` is the same function reference.
**Warning signs:** Memory grows on each page reload; console messages duplicated N times per reload cycle.

### Pitfall 6: Mobile Chrome and Panel Resize Drag
**What goes wrong:** CSS `pointer-events` for panel resize drag handles work on desktop but not on mobile Chrome (touch events differ from mouse events).
**Why it happens:** The resize behavior uses `mousedown/mousemove/mouseup`. Mobile Chrome fires `touchstart/touchmove/touchend` instead.
**How to avoid:** Since the decision is to use tab-switching on mobile (not resizable panels), apply `@media (max-width: 768px)` to hide all drag handles and activate the tab UI. Don't add touch drag support for mobile — the tab UI replaces it.
**Warning signs:** Mobile users see panel dividers but cannot drag them.

---

## Code Examples

Verified patterns from official sources:

### Lua Syntax Highlighting in CodeMirror 6
```javascript
// Source: @codemirror/legacy-modes README (official CodeMirror package)
import { EditorView, basicSetup } from 'codemirror';
import { StreamLanguage } from '@codemirror/language';
import { lua } from '@codemirror/legacy-modes/mode/lua';

const view = new EditorView({
  extensions: [
    basicSetup,
    StreamLanguage.define(lua),
  ],
  parent: document.getElementById('editor'),
});
```

### Spawn love.exe from WSL Node.js
```javascript
// Source: Node.js child_process docs; wslpath is WSL built-in
import { spawn, execSync } from 'node:child_process';

const winProjectPath = execSync(`wslpath -w "${projectPath}"`).toString().trim();
const proc = spawn(loveExePath, [winProjectPath], {
  shell: false,
  detached: false,
});
proc.stdout.on('data', (buf) => handleOutput(buf.toString()));
proc.stderr.on('data', (buf) => handleOutput(buf.toString()));
```

### Parse Love2D Error Line for File+Line Reference
```javascript
// Pattern derived from Love2D error screen format
// Error line format:  "Error main.lua:35: attempt to call..."
// Stack trace format: "main.lua:17: in function 'draw'"
const ERROR_PATTERN = /([^:\s]+\.lua):(\d+)/g;

function linkifyErrors(text) {
  return text.replace(ERROR_PATTERN, (match, file, line) => {
    return `<a href="#" data-file="${file}" data-line="${line}">${match}</a>`;
  });
}
```

### chokidar Watch Directory (v4 API)
```javascript
// Source: chokidar README (v4 — glob removed, directory path required)
import chokidar from 'chokidar';

const watcher = chokidar.watch(projectPath, {
  usePolling: true,
  interval: 300,
  ignoreInitial: true,
  ignored: /(^|[\/\\])\../,
});

let debounce = null;
watcher.on('change', () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => triggerReload(), 350);
});
```

### .love Export (archiver + ignore)
```javascript
// Source: archiver npm docs, ignore npm docs
import archiver from 'archiver';
import ignore from 'ignore';

function streamLoveFile(projectPath, projectName, res) {
  const ig = ignore();
  const ignorePath = `${projectPath}/.loveignore`;
  if (fs.existsSync(ignorePath)) {
    ig.add(fs.readFileSync(ignorePath, 'utf8'));
  }

  res.setHeader('Content-Disposition', `attachment; filename="${projectName}.love"`);
  res.setHeader('Content-Type', 'application/zip');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => res.destroy(err));
  archive.pipe(res);

  archive.glob('**', {
    cwd: projectPath,
    dot: false,
    filter: (entry) => !ig.ignores(entry),
  });

  archive.finalize();
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CodeMirror 5 with separate Lua mode file | CodeMirror 6 + `@codemirror/legacy-modes` | CM6 released 2022 | Requires bundling (esbuild); no CDN drop-in anymore |
| chokidar v3 with glob patterns in watch path | chokidar v4 — directory path only, no globs | September 2024 | Watch path must be a directory string; filter in handler |
| chokidar v4 (CJS+ESM) | chokidar v5 — ESM-only, Node 20+ required | November 2025 | Use v4 if project targets Node 18; use v5 if Node 20+ |
| Community LSP packages (FurqanSoftware, marc2332) | `@marimo-team/codemirror-languageserver` v1.16.x | Active in 2026 | Best-maintained CM6 LSP client as of research date |
| Manual SSE text/event-stream headers | Same — SSE is stable HTTP standard | N/A | No change; SSE is the right choice for unidirectional streaming |

**Deprecated/outdated:**
- `arnoson/codemirror-lua`: Experimental repo, documented "Loading workspace (0/0)" bug, 7 commits — not production-ready
- chokidar v3 glob paths in `watch()`: Silently broken in v4+
- CodeMirror 5 Lua mode (`codemirror.net/5/mode/lua`): CM5 is maintained but new projects should use CM6

---

## Open Questions

1. **lua-language-server binary location on this machine**
   - What we know: `lua-language-server` is referenced in CONTEXT.md as the expected LSP; Phase 1 established WSL tool environment
   - What's unclear: Whether lua-language-server is already installed in WSL or needs to be installed as part of Phase 3 Wave 0
   - Recommendation: Wave 0 task should verify/install lua-language-server in WSL; add to Phase 3 setup checklist

2. **love.exe config path storage**
   - What we know: Phase 1 established a WSL alias for love.exe; the exact Windows path is in the alias
   - What's unclear: Whether the server should read the path from a config file or hard-code it
   - Recommendation: Create `ide/config.json` (gitignored) with `lovePath` field set during setup; fallback to environment variable `LOVE_PATH`

3. **LSP message framing over WebSocket**
   - What we know: lua-language-server communicates via LSP JSON-RPC over stdio with `Content-Length` headers
   - What's unclear: Whether `@marimo-team/codemirror-languageserver`'s WebSocketTransport expects raw LSP frames (with Content-Length headers) or unwrapped JSON
   - Recommendation: Verify during Wave 0 by inspecting the marimo-team package's transport source; may require a thin framing layer in the proxy

4. **LSP on mobile Chrome**
   - What we know: Mobile tab-switching UI hides the editor panel when other panels are shown
   - What's unclear: Whether WebSocket-based LSP connection survives tab-switching in mobile Chrome (background tab throttling)
   - Recommendation: Acceptable to have LSP disconnect/reconnect on mobile tab switches; not a blocking concern for v0.1

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — Node.js built-in `node:test` recommended (no install required) |
| Config file | none — scripts in `package.json` |
| Quick run command | `node --test ide/tests/*.test.js` |
| Full suite command | `node --test ide/tests/*.test.js` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IDE-01 | Server starts and binds 0.0.0.0:3000 | smoke | `node --test ide/tests/server.test.js` | ❌ Wave 0 |
| IDE-02 | GET /api/files returns directory tree JSON | unit | `node --test ide/tests/files.test.js` | ❌ Wave 0 |
| IDE-03 | GET /api/files/:path returns file content | unit | `node --test ide/tests/files.test.js` | ❌ Wave 0 |
| IDE-04 | editor.bundle.js exists and contains Lua mode token | smoke | `node -e "require('fs').statSync('ide/public/editor.bundle.js')"` | ❌ Wave 0 |
| IDE-05 | POST /api/run spawns process; POST /api/stop kills it | manual-only | N/A — requires love.exe and display | manual |
| IDE-06 | SSE /api/console/stream sends data events | unit | `node --test ide/tests/console.test.js` | ❌ Wave 0 |
| IDE-07 | File save triggers watcher callback within 500ms (polling) | unit | `node --test ide/tests/watcher.test.js` | ❌ Wave 0 |
| IDE-08 | linkifyErrors() converts lua:line to anchor tags | unit | `node --test ide/tests/error-parser.test.js` | ❌ Wave 0 |
| IDE-09 | GET /api/export returns valid ZIP with project files | unit | `node --test ide/tests/export.test.js` | ❌ Wave 0 |

IDE-05 is manual-only because it requires a running Windows display, love.exe, and a real project path — not automatable in WSL CI.

### Sampling Rate
- **Per task commit:** `node --test ide/tests/*.test.js`
- **Per wave merge:** `node --test ide/tests/*.test.js`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `ide/tests/server.test.js` — covers IDE-01 (server binds and serves index.html)
- [ ] `ide/tests/files.test.js` — covers IDE-02, IDE-03 (file tree and read endpoints)
- [ ] `ide/tests/console.test.js` — covers IDE-06 (SSE emits data events)
- [ ] `ide/tests/watcher.test.js` — covers IDE-07 (chokidar polling fires callback)
- [ ] `ide/tests/error-parser.test.js` — covers IDE-08 (regex linkification)
- [ ] `ide/tests/export.test.js` — covers IDE-09 (archiver produces valid zip)
- [ ] `ide/package.json` — Node.js project manifest with test script
- [ ] `ide/public/editor.bundle.js` — built by esbuild Wave 0 build step; covers IDE-04

---

## Sources

### Primary (HIGH confidence)
- `@codemirror/legacy-modes` GitHub (official CodeMirror org) — Lua StreamLanguage pattern verified
- `codemirror.net/examples/bundle/` — CodeMirror 6 bundling with esbuild/rollup; minimalSetup vs basicSetup
- `nodejs.org/api/child_process.html` — spawn vs exec; stdout streaming pattern
- `@marimo-team/codemirror-languageserver` GitHub — WebSocketTransport, v1.16.12 (Feb 2026)

### Secondary (MEDIUM confidence)
- `paulmillr/chokidar` GitHub README — v4 breaking changes (glob removal); v5 ESM-only; usePolling for WSL2
- `archiverjs/node-archiver` GitHub — streaming ZIP to HTTP response
- `kaelzhang/node-ignore` GitHub — gitignore-spec compliant pattern matching
- vitejs/vite WSL2 issue #18381 — confirms usePolling required for /mnt/c paths

### Tertiary (LOW confidence)
- `arnoson/codemirror-lua` GitHub — investigated and rejected (7 commits, documented bug)
- Love2D forums (error format patterns) — error output format inferred from forum examples; no official stderr spec documented

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against official GitHub/npm; versions confirmed
- Architecture: HIGH — patterns derived from official docs and established Node.js idioms
- LSP wiring: MEDIUM — `@marimo-team/codemirror-languageserver` is the best option found, but message framing between WebSocket and lua-language-server stdio needs empirical verification (Open Question 3)
- Pitfalls: HIGH — WSL2 chokidar and path conversion issues are well-documented with multiple independent sources confirming them

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (chokidar and codemirror-languageserver are active packages; re-check if > 30 days)
