# Phase 3: Web IDE - Research

**Researched:** 2026-03-12
**Domain:** Node.js (Windows-native) + Monaco Editor + Lua LSP + chokidar + child_process + archiver
**Confidence:** MEDIUM-HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Panel layout**
- VS Code style: sidebar file tree left, Monaco editor center, console panel bottom
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

**Editor**
- Monaco Editor (VS Code's editor component) — not CodeMirror
- Custom theme required — default Monaco look is ugly, needs a clean/modern skin
- Monaco has built-in LSP protocol support — wire LuaLS/lua-language-server through it

**Lua LSP**
- Must-have for Phase 3 — real-time syntax errors, autocomplete, and diagnostics in the editor
- Use LuaLS/lua-language-server with Monaco's built-in LSP support
- Monaco handles the language client side natively

**.love export**
- Export button in the top toolbar
- Server-side zip of the project directory, browser downloads the .love file
- Export respects a `.loveignore` file in the project root (similar to .gitignore format) for excluding files
- Browser download only — no extra files saved to project directory

**Hard requirements from Specifics**
- IDE must be accessible from mobile Chrome over WiFi — hard requirement
- Vanilla HTML/CSS/JS for v0.1 — no React/Vue framework
- Everything runs on Windows natively — Node.js server, Love2D, filesystem. WSL is only used for Claude Code
- Love2D is spawned as a Windows native process (love.exe), not inside WSL

### Claude's Discretion
- Monaco custom theme design (must look clean/modern, not default VS Code aesthetic)
- Node.js server framework choice (Express, Koa, plain http, etc.)
- WebSocket vs SSE for real-time console streaming
- File tree component implementation details
- .loveignore parsing implementation (glob library choice)
- Mobile tab-switching UI design details
- Monaco-to-LuaLS wiring approach (monaco-languageclient or similar)

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
| IDE-03 | User can open files from file tree into code editor | REST GET `/api/files/:path` endpoint + Monaco `setValue` to swap content |
| IDE-04 | Code editor panel with Lua syntax highlighting (Monaco Editor) | Monaco has built-in Lua Monarch tokenizer in `basic-languages/lua` — set `language: 'lua'` |
| IDE-05 | User can run Love2D game from IDE (server spawns native Love2D child process on host) | `child_process.spawn` with Windows-native paths; Node.js runs on Windows, no wslpath needed |
| IDE-06 | Console panel captures and displays Love2D stdout/stderr output in real time | SSE (`/api/console/stream`) or WebSocket; `spawn.stdout.on('data')` piped to connected clients |
| IDE-07 | Live reload: game auto-restarts when Lua files are saved (debounced) | chokidar on Windows NTFS (native events work; usePolling optional but safe); 300-500ms debounce |
| IDE-08 | Error display: Love2D errors parsed and shown with file:line reference | Regex on stderr output: `/([^\s]+\.lua):(\d+)/g`; clickable anchors in console DOM |
| IDE-09 | User can export (download/package) project as .love file from IDE | `archiver` npm package streams ZIP to browser response; `ignore` npm package parses `.loveignore` |
</phase_requirements>

---

## Summary

Phase 3 builds a self-contained Node.js web server that runs natively on Windows and serves a single-page IDE. The frontend is vanilla HTML/CSS/JS with Monaco Editor as the editor component — no React/Vue, no build tool at runtime (the Monaco bundle is built once with esbuild and committed). The server provides REST endpoints for file CRUD and export, SSE for console streaming, and manages Love2D child process lifecycle.

**Critical platform clarification from CONTEXT.md:** The Node.js server runs on Windows natively, not in WSL. This changes three previous research assumptions: (1) no `wslpath -w` conversion needed — Windows paths are used directly; (2) chokidar on Windows NTFS can use native file events (no forced `usePolling`); (3) `love.exe` is spawned with a normal Windows path like `C:\Program Files\LOVE\love.exe`, not a WSL path.

The most technically involved areas are: (1) bundling Monaco Editor with esbuild including its required web workers (each worker must be a separate bundle); (2) wiring Lua LSP (lua-language-server on Windows) via WebSocket proxy to Monaco using `monaco-languageclient` v10 or the lighter `vscode-ws-jsonrpc` direct approach; (3) designing a custom Monaco theme that avoids the default VS Code aesthetic. Everything else (file tree, panel layout, error link parsing, .love export) is straightforward Node.js and DOM work.

**Primary recommendation:** Express + SSE for console streaming + chokidar v4 without forced usePolling (Windows NTFS) + Monaco Editor built-in Lua mode + `monaco-languageclient` v10 for LSP + `archiver` for .love export + `ignore` for .loveignore parsing + esbuild to produce `editor.bundle.js` + `editor.worker.js`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | ^4.x | HTTP server, REST API, static file serving | Minimal boilerplate; familiar; no lock-in |
| ws | ^8.x | WebSocket server (for LSP proxy) | Native Node.js WebSocket; required for LSP relay |
| chokidar | ^4.x | Filesystem watch | v4 is CJS+ESM; glob removed (use directory path); on Windows NTFS native events work |
| monaco-editor | ^0.52.x | Browser code editor with Lua support | Industry standard; Lua is a built-in language (Monarch tokenizer in `basic-languages/lua`) |
| monaco-languageclient | ^10.x | LSP client plugin for Monaco via WebSocket | TypeFox-maintained; v10 released Feb 2026; aligns with monaco-editor 0.52+ |
| vscode-ws-jsonrpc | ^3.x | WebSocket-to-JSON-RPC bridge for LSP proxy | Ships with monaco-languageclient monorepo; handles LSP Content-Length framing |
| archiver | ^7.x | ZIP creation streamed to HTTP response | Standard Node.js zip library; streaming avoids temp files |
| ignore | ^6.x | Parse .loveignore (gitignore-format) | Used by eslint/prettier; correctly implements gitignore spec |
| esbuild | ^0.x (devDep) | Bundle Monaco + workers into browser JS files | One-shot build; fastest bundler; required because Monaco is ESM-only |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lua-language-server | binary (Windows) | Provides LSP diagnostics/autocomplete for Lua | Install as Windows binary; server proxies stdio over WebSocket |
| monaco-themes | ^0.4.x | Pre-built VS Code theme JSON files for Monaco | Load a theme JSON and pass to `monaco.editor.defineTheme()` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `monaco-languageclient` v10 | `vscode-ws-jsonrpc` direct wiring | vscode-ws-jsonrpc alone handles the server-side proxy; monaco-languageclient adds the client-side LSP client on top. For this project, the full stack is correct since we need both sides |
| `monaco-languageclient` v10 | `@marimo-team/codemirror-languageserver` | That package is CodeMirror-specific — not applicable for Monaco |
| `archiver` | `jszip` | archiver streams directly to response (no full-file buffering); jszip requires loading everything into memory |
| `ignore` | `minimatch` | `ignore` correctly implements gitignore spec; minimatch does not |
| chokidar v4 | chokidar v5 | v5 is ESM-only, Node 20+ required; v4 supports CJS+ESM and Node 18+ |
| Express | plain `http` | `http` removes a dependency but requires manual routing; Express is minimal overhead |
| SSE | WebSocket for console | SSE is simpler (plain HTTP, auto-reconnect, no library); WebSocket is needed for LSP anyway so both will be present |

**Installation:**
```bash
# Server dependencies (run on Windows via cmd/PowerShell in ide/ directory)
npm install express ws chokidar archiver ignore

# Monaco LSP client dependencies
npm install monaco-languageclient vscode-ws-jsonrpc

# Dev dependency (build step only)
npm install --save-dev esbuild

# Monaco editor (bundled by esbuild into public/; not loaded from node_modules at runtime)
npm install monaco-editor monaco-themes
```

---

## Architecture Patterns

### Recommended Project Structure
```
ide/
├── server.js              # Express app entry point; binds 0.0.0.0:3000
├── package.json           # Dependencies; type: "module" for ESM
├── config.json            # gitignored; lovePath, projectPath, lsPath set during setup
├── routes/
│   ├── files.js           # GET /api/files (tree), GET /api/files/:path (read), PUT /api/files/:path (write)
│   ├── run.js             # POST /api/run (spawn/kill love.exe), POST /api/stop
│   ├── console.js         # GET /api/console/stream (SSE endpoint)
│   ├── export.js          # GET /api/export (stream ZIP response)
│   └── lsp.js             # WebSocket proxy: browser <-> lua-language-server.exe stdio
├── lib/
│   ├── process-manager.js # Owns love.exe ChildProcess; kill+restart; event emitter
│   ├── watcher.js         # chokidar setup; debounce; fires 'change' events
│   └── console-bus.js     # EventEmitter; process-manager writes; SSE route reads
├── public/
│   ├── index.html         # Single HTML file; loads editor.bundle.js + editor.worker.js
│   ├── editor.bundle.js   # Built by esbuild (committed); Monaco editor + LSP client
│   ├── editor.worker.js   # Built by esbuild (committed); Monaco text model worker
│   ├── style.css          # Layout, panels, mobile tabs
│   └── app.js             # Vanilla JS: DOM wiring, file tree, panel resize, tabs
└── build/
    ├── editor-entry.mjs   # esbuild entry: imports Monaco, configures MonacoEnvironment
    └── build.mjs          # esbuild script to regenerate public/*.bundle.js files
```

### Pattern 1: Monaco Editor Bundle (esbuild + workers)

**What:** Monaco Editor is ESM-only and requires bundling. It also uses Web Workers for syntax processing — these workers must be bundled as **separate files** and referenced via `MonacoEnvironment.getWorkerUrl`. The editor main bundle and at least one worker bundle must be output.

**Why this approach:** The server is plain Express with no build pipeline at request time. Building once with esbuild and committing the output is the correct approach for vanilla HTML.

**Critical detail:** Monaco's worker setup changed in v0.22+. The ESM build no longer defines a global `monaco` object by default. Use esbuild's `globalName` to expose the API under a project-specific name.

**Example (build script):**
```javascript
// build/build.mjs
// Source: monaco-editor docs/integrate-esm.md + esbuild docs
import * as esbuild from 'esbuild';

// Build the editor worker (required for all Monaco instances)
await esbuild.build({
  entryPoints: ['node_modules/monaco-editor/esm/vs/editor/editor.worker.js'],
  bundle: true,
  format: 'iife',
  outfile: 'public/editor.worker.js',
  minify: true,
  platform: 'browser',
});

// Build the main editor bundle
await esbuild.build({
  entryPoints: ['build/editor-entry.mjs'],
  bundle: true,
  format: 'iife',
  globalName: 'MonacoIDE',   // window.MonacoIDE exposes the editor API
  outfile: 'public/editor.bundle.js',
  minify: true,
  platform: 'browser',
  target: ['chrome90', 'firefox88'],
});
```

```javascript
// build/editor-entry.mjs
import * as monaco from 'monaco-editor';
import { MonacoLanguageClient, CloseAction, ErrorAction } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';

// Tell Monaco where to find the worker bundle
self.MonacoEnvironment = {
  getWorkerUrl: function(_moduleId, _label) {
    // For this project (Lua only), one editor worker is sufficient.
    // Add language-specific workers (ts.worker.js, json.worker.js) if other languages are added.
    return '/editor.worker.js';
  }
};

function createLanguageClient(transports) {
  return new MonacoLanguageClient({
    name: 'Lua Language Client',
    clientOptions: {
      documentSelector: [{ language: 'lua' }],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
    },
    connectionProvider: {
      get: () => Promise.resolve(transports),
    },
  });
}

export function connectLsp(wsUrl) {
  const webSocket = new WebSocket(wsUrl);
  webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const client = createLanguageClient({ reader, writer });
    client.start();
    reader.onClose(() => client.stop());
  };
}

export { monaco };
```

```html
<!-- public/index.html — load the committed bundles, no CDN, no runtime build step -->
<script src="/editor.bundle.js"></script>
```

### Pattern 2: Monaco Lua Syntax Highlighting

**What:** Monaco has Lua support built-in via a Monarch tokenizer at `src/basic-languages/lua/`. When Monaco is bundled with esbuild, this language is included automatically. Set `language: 'lua'` when creating an editor instance.

**Confidence:** HIGH — confirmed by direct GitHub source: `microsoft/monaco-editor/src/basic-languages/lua/` exists in the main branch. The language ID is `'lua'`.

**Example:**
```javascript
// public/app.js — window.MonacoIDE is set by editor.bundle.js (IIFE globalName)
const { monaco } = window.MonacoIDE;

const editor = monaco.editor.create(document.getElementById('editor-container'), {
  value: '-- Lua code here\nfunction love.draw()\n  love.graphics.print("Hello")\nend',
  language: 'lua',
  theme: 'lua-dark',          // custom theme defined below
  automaticLayout: true,      // resizes with container — essential for panel layout
  minimap: { enabled: false }, // cleaner look without minimap
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
});

// Update content when user opens a file
function openFile(content) {
  editor.setValue(content);
}

// Get cursor position for error navigation
function goToLine(lineNumber) {
  editor.revealLineInCenter(lineNumber);
  editor.setPosition({ lineNumber, column: 1 });
  editor.focus();
}
```

### Pattern 3: Monaco Custom Theme

**What:** Monaco's `defineTheme` API accepts a theme object with `base` (inherit from `'vs-dark'`), `inherit` flag, `rules` array (token-level colors), and `colors` object (editor UI colors). Must be called before `monaco.editor.create()`.

**Recommendation:** Embed the custom theme directly in `editor-entry.mjs` (no runtime fetch required). Use a Tokyo Night-inspired palette — it is clean, low-contrast, visually distinct from default VS Code dark, and easy on the eyes.

**Example (embedded custom theme in editor-entry.mjs):**
```javascript
// build/editor-entry.mjs — embedded custom theme
// Source: monaco-editor defineTheme API docs
monaco.editor.defineTheme('lua-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment',    foreground: '565F89', fontStyle: 'italic' },
    { token: 'keyword',    foreground: 'BB9AF7' },
    { token: 'string',     foreground: '9ECE6A' },
    { token: 'number',     foreground: 'FF9E64' },
    { token: 'delimiter',  foreground: 'C0CAF5' },
    { token: 'identifier', foreground: '7DCFFF' },
    { token: 'type',       foreground: '2AC3DE' },
  ],
  colors: {
    'editor.background':               '#1A1B26',
    'editor.foreground':               '#C0CAF5',
    'editorLineNumber.foreground':     '#3B4261',
    'editorLineNumber.activeForeground': '#737AA2',
    'editorCursor.foreground':         '#C0CAF5',
    'editor.selectionBackground':      '#28344A',
    'editor.lineHighlightBackground':  '#1F2335',
    'editorIndentGuide.background1':   '#292E42',
    'editorBracketMatch.background':   '#2E3A4C',
    'editorBracketMatch.border':       '#3D59A1',
  }
});
```

**Alternative (load from monaco-themes package at build time):**
Copy a JSON file from `node_modules/monaco-themes/themes/` (e.g., `Night Owl.json`) into `public/themes/` as a build step, then fetch it in `app.js`. This approach is valid but requires a runtime fetch before the editor can initialize. Embedding the theme is simpler.

### Pattern 4: SSE Console Stream

**What:** Server pushes Love2D stdout/stderr to browser as Server-Sent Events over a long-lived HTTP connection. Data flows server-to-client only.

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

### Pattern 5: Process Manager (Windows-native, kill+restart)

**What:** A module that owns a single `ChildProcess` reference. Since Node.js runs on Windows natively, paths are Windows paths — no `wslpath` conversion needed.

**Key Windows-specific notes:**
- `spawn()` with `shell: false` works correctly on Windows for `.exe` files
- The Windows path to `love.exe` comes from `config.json` (set during Phase 1 setup)
- `SIGTERM` semantics differ on Windows — call `proc.kill()` with no argument; Node.js maps this to `TerminateProcess()` on Windows
- `windowsHide: false` keeps the Love2D window visible

**Example:**
```javascript
// Source: Node.js child_process docs
// lib/process-manager.js
import { spawn } from 'node:child_process';
import { consoleBus } from './console-bus.js';

let currentProcess = null;

export function killCurrent() {
  if (currentProcess) {
    currentProcess.kill();   // TerminateProcess() on Windows — no argument
    currentProcess = null;
  }
}

export function launch(projectPath, loveExePath) {
  // projectPath: Windows path, e.g. C:\Users\Trynda\Desktop\Dev\Lua\projects\01-pong
  // loveExePath: Windows path, e.g. C:\Program Files\LOVE\love.exe
  // No wslpath conversion — server runs on Windows natively
  killCurrent();
  consoleBus.emit('clear');

  currentProcess = spawn(loveExePath, [projectPath], {
    shell: false,
    windowsHide: false,   // Keep Love2D window visible
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

### Pattern 6: chokidar on Windows NTFS

**What:** Watch the project directory for Lua file changes. On Windows NTFS (where the server runs), native file system events work without polling. The Phase 1 decision about `usePolling: true` was made for WSL2 cross-9P paths — that concern does not apply when Node.js runs on Windows.

**Recommendation:** Default to native events (`usePolling: false`). Add `usePolling: true` as a fallback option in `config.json` in case any edge case arises, but the default for Windows NTFS is native events.

**Example:**
```javascript
// Source: chokidar README (v4 — glob removed, directory path required)
// lib/watcher.js
import chokidar from 'chokidar';

let debounceTimer = null;

export function startWatcher(projectPath, onChanged) {
  // projectPath: Windows path e.g. C:\Users\Trynda\...\projects\01-pong
  const watcher = chokidar.watch(projectPath, {
    usePolling: false,      // Windows NTFS native events; no WSL2 9P issue
    ignored: /(^|[\/\\])\../,
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

**Note:** chokidar v4 removed glob pattern support from the watch path argument. Pass a directory path string, not `**/*.lua`.

### Pattern 7: LSP WebSocket Proxy (lua-language-server on Windows)

**What:** The Express server opens a WebSocket server. When the browser connects, the server spawns `lua-language-server.exe` as a Windows child process and relays JSON-RPC messages between WebSocket and the process stdio.

**Architecture:**
```
Browser (Monaco + monaco-languageclient)
  <-- WebSocket ws://host/lsp --> Node.js WSProxy (vscode-ws-jsonrpc)
                                    <-- stdio --> lua-language-server.exe (Windows binary)
```

**LSP message framing:** `lua-language-server` communicates via LSP JSON-RPC over stdio with `Content-Length: N\r\n\r\n` headers. `vscode-ws-jsonrpc` handles this framing automatically — do not strip or add Content-Length headers manually in the proxy.

**Example (server-side proxy):**
```javascript
// routes/lsp.js
// Source: vscode-ws-jsonrpc README + TypeFox/monaco-languageclient examples
import { WebSocketServer } from 'ws';
import { createServerProcess, forward } from 'vscode-ws-jsonrpc/server';

export function attachLspProxy(httpServer, lsPath) {
  // lsPath: Windows path to lua-language-server.exe
  // e.g. C:\tools\lua-language-server\bin\lua-language-server.exe
  const wss = new WebSocketServer({ server: httpServer, path: '/lsp' });

  wss.on('connection', (ws) => {
    const socket = {
      send: (content) => ws.send(content, (err) => { if (err) console.error(err); }),
      onMessage: (cb) => ws.on('message', cb),
      onError: (cb) => ws.on('error', cb),
      onClose: (cb) => ws.on('close', cb),
      dispose: () => ws.close(),
    };

    const lsProcess = createServerProcess('Lua', lsPath);
    forward(socket, lsProcess, (message) => message);
  });
}
```

**Call from app.js:**
```javascript
// public/app.js
const { connectLsp } = window.MonacoIDE;
connectLsp(`ws://${location.host}/lsp`);
```

### Pattern 8: .love Export with .loveignore

**What:** Stream a ZIP archive of the project to the browser, respecting a `.loveignore` filter file.

**Example:**
```javascript
// Source: archiver npm docs + ignore npm docs
// routes/export.js
import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';
import ignore from 'ignore';

export function exportLove(projectPath, projectName, req, res) {
  const ig = ignore();
  const ignorePath = path.join(projectPath, '.loveignore');
  if (fs.existsSync(ignorePath)) {
    ig.add(fs.readFileSync(ignorePath, 'utf8'));
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${projectName}.love"`);

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

### Anti-Patterns to Avoid
- **Using `wslpath` to convert paths:** The Node.js server runs on Windows. Paths are already Windows paths. `wslpath` does not exist in a native Windows Node.js process — this call will throw ENOENT.
- **Assuming `usePolling: true` is required:** The WSL2 9P polling requirement only applies when Node.js runs in WSL. On Windows NTFS, native chokidar events fire without polling.
- **Using `exec()` for love.exe:** `exec()` buffers output and spawns a shell. Use `spawn()` directly — it streams stdout/stderr.
- **Using `SIGTERM` argument with `proc.kill()`:** On Windows, the argument is ignored — `proc.kill()` calls `TerminateProcess()` regardless. Omit the signal argument to be explicit.
- **Loading Monaco from CDN at runtime:** Monaco ESM packages on CDNs have resolution issues. Always use the pre-built local bundle.
- **Building `editor.bundle.js` without a separate worker:** If `editor.worker.js` is not bundled and served separately, Monaco will fail to initialize with worker errors. The worker is mandatory.
- **Forgetting `MonacoEnvironment.getWorkerUrl`:** Without this, Monaco tries to load workers using paths that do not exist in the IIFE build, causing silent failures.
- **Relying on `window.monaco`:** Since Monaco ESM v0.22+, `window.monaco` is not defined by default. Use `window.MonacoIDE.monaco` via the esbuild `globalName`.
- **Blocking the event loop during export:** Never use synchronous fs operations during archive creation. `archiver` is streaming — let it be streaming.
- **SSE connection leaks:** Always register `req.on('close', cleanup)` immediately after `res.flushHeaders()`. Without it, listeners accumulate on each page reload, causing duplicated console output.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| .loveignore parsing | Custom glob parser | `ignore` npm package | gitignore spec has 20+ edge cases (trailing spaces, negation, path anchoring); `ignore` handles all of them |
| ZIP file creation | Manual ZIP byte writing | `archiver` | ZIP format has local file headers, central directory, CRC32 — complex to get right; archiver is battle-tested |
| LSP client protocol | Custom JSON-RPC LSP client | `monaco-languageclient` + `vscode-ws-jsonrpc` | LSP is a complex protocol (initialization handshake, capabilities negotiation, incremental sync); hand-rolling would take weeks |
| Console streaming | Long-polling or manual chunked responses | SSE (`EventSource` / `text/event-stream`) | SSE is a browser native standard with automatic reconnect; no library needed beyond correct Content-Type header |
| File watcher | Custom ReadDirectoryChangesW binding | chokidar | chokidar abstracts Windows/macOS/Linux APIs; handles recursive watching, error recovery |
| Monaco worker bundling | Custom webpack config | esbuild with separate worker entry points | One-shot build; committed output; no runtime build step needed |
| LSP Content-Length framing | Manual buffer parsing | `vscode-ws-jsonrpc` | LSP stdio framing is non-trivial (streaming buffer chunks, partial messages); vscode-ws-jsonrpc handles it correctly |
| Lua syntax highlighting | Custom Monarch tokenizer | Monaco built-in (`language: 'lua'`) | Monaco already ships a Lua Monarch tokenizer; no extra work needed |

**Key insight:** Every custom solution in this list exists specifically because the problem contains hidden complexity that only manifests at edge cases. Use the library.

---

## Common Pitfalls

### Pitfall 1: wslpath Does Not Exist on Windows
**What goes wrong:** Code calls `execSync('wslpath -w ...')` inside the Node.js server process — the command fails with ENOENT.
**Why it happens:** `wslpath` is a WSL utility. The server runs on Windows where it does not exist. The previous research (written assuming WSL Node.js) included wslpath calls — those must not be used.
**How to avoid:** The server uses Windows paths directly. `projectPath` is `C:\Users\Trynda\Desktop\Dev\Lua\projects\01-pong`. `loveExePath` is `C:\Program Files\LOVE\love.exe`. Read both from `ide/config.json`.
**Warning signs:** ENOENT on server startup or on the first Run button click.

### Pitfall 2: Monaco Worker Not Found (IIFE build)
**What goes wrong:** Editor loads but shows no syntax highlighting and throws `Could not create a model` or worker timeout errors in the browser console.
**Why it happens:** Monaco's IIFE bundle attempts to load a web worker from a URL. If `MonacoEnvironment.getWorkerUrl` is not defined in `editor-entry.mjs`, or if `editor.worker.js` is not served at the expected path, the worker fails to load.
**How to avoid:** Always bundle `editor.worker.js` as a separate esbuild output. Set `MonacoEnvironment.getWorkerUrl` in `editor-entry.mjs` before any editor creation. Verify the worker is accessible at `/editor.worker.js` with a browser fetch before creating the editor.
**Warning signs:** Browser console shows `Worker: failed to fetch` or `Uncaught Error: Could not create worker`.

### Pitfall 3: Love2D Process Kill on Windows
**What goes wrong:** `currentProcess.kill('SIGTERM')` is called but the Love2D window stays open. Subsequent launches spawn a second Love2D instance alongside the first.
**Why it happens:** Windows does not support POSIX signals. Node.js's `child.kill()` on Windows calls `TerminateProcess()`. If love.exe spawns sub-processes, those may survive.
**How to avoid:** Call `proc.kill()` (no argument). For robustness, also run `taskkill /F /PID {pid}` via `execSync` if zombie processes are suspected during testing.
**Warning signs:** Multiple Love2D windows open; `currentProcess` reference becomes stale while Love2D window is still visible.

### Pitfall 4: Love2D stderr Contains Non-Error Output
**What goes wrong:** Regex for error parsing matches normal debug output or Love2D startup messages, producing spurious clickable links.
**Why it happens:** Love2D writes informational lines to stderr on startup. The pattern `filename.lua:NNN` can appear in stack traces, normal output piped via stderr, and actual errors.
**How to avoid:** Only linkify lines that match Love2D's error pattern. Primary error line: `Error\s+(.+\.lua):(\d+):`. Stack trace lines: `([^\s]+\.lua):(\d+):\s+in`.
**Warning signs:** Every console line is a clickable link.

### Pitfall 5: SSE Connection Leaks on Page Reload
**What goes wrong:** Each browser reload creates a new EventSource connection. Server accumulates orphaned listeners on `consoleBus`, causing console messages to appear N times (once per reload).
**Why it happens:** Missing `req.on('close', cleanup)` handler, or the cleanup handler uses a different function reference than the listener.
**How to avoid:** Always register `req.on('close', () => consoleBus.off('line', onLine))` immediately after `res.flushHeaders()`. `onLine` must be the same function reference used in `.on('line', onLine)`.
**Warning signs:** Memory grows on each page reload; console messages duplicated.

### Pitfall 6: Monaco Mobile Chrome — Limited Touch Support
**What goes wrong:** Text selection, cursor placement, and keyboard invocation are unreliable on mobile Chrome.
**Why it happens:** Monaco Editor was designed for desktop and has open issues (#1504, #4622) for mobile touch support. Text selection via long-press triggers a context menu instead of cursor selection on some Android Chrome versions.
**How to avoid:** The decision is tab-switching UI on mobile — one panel at a time. The editor panel gets full screen height on mobile, which maximizes usability. Cursor tap-to-place works in most cases even if range selection is imperfect.
**Warning signs:** Mobile users cannot select text ranges; keyboard does not appear on editor tap.

### Pitfall 7: chokidar v4 Glob Syntax Removed
**What goes wrong:** `chokidar.watch('C:\\path\\**\\*.lua')` silently watches nothing in chokidar v4+.
**Why it happens:** v4 (September 2024) removed glob support from watch paths. No error is thrown — the watcher sets up without error but never fires events.
**How to avoid:** Pass a directory path: `chokidar.watch('C:\\Users\\...\\projects\\01-pong', { ... })`. Filter to `.lua` files in the change handler if needed.
**Warning signs:** Watcher set up without error, but live reload never fires.

### Pitfall 8: Monaco `window.monaco` Undefined After Bundle Load
**What goes wrong:** `window.monaco` is undefined after the IIFE bundle loads, causing `TypeError: Cannot read properties of undefined (reading 'editor')`.
**Why it happens:** Since Monaco ESM v0.22+, the bundle does not define a global `monaco` object unless `MonacoEnvironment.globalAPI = true` is set, or unless you explicitly export it under your own global name via esbuild `globalName`.
**How to avoid:** Set `globalName: 'MonacoIDE'` in esbuild and export `{ monaco }` from `editor-entry.mjs`. Access as `window.MonacoIDE.monaco` in `app.js`. Do not rely on `window.monaco`.
**Warning signs:** `ReferenceError: monaco is not defined` in browser console immediately after the bundle loads.

---

## Code Examples

Verified patterns from official sources:

### Create Monaco Editor with Lua Highlighting
```javascript
// Source: monaco-editor API docs — language: 'lua' is a built-in language
const { monaco } = window.MonacoIDE;

const editor = monaco.editor.create(document.getElementById('editor-container'), {
  value: '',
  language: 'lua',
  theme: 'lua-dark',
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
});

function openFile(content) {
  editor.setValue(content);
}

function goToLine(lineNumber) {
  editor.revealLineInCenter(lineNumber);
  editor.setPosition({ lineNumber, column: 1 });
  editor.focus();
}
```

### Spawn love.exe from Windows Node.js (no wslpath)
```javascript
// Source: Node.js child_process docs
// Node.js runs on Windows — paths are Windows paths directly
import { spawn } from 'node:child_process';

// Both paths are Windows paths from config.json
// loveExePath = "C:\\Program Files\\LOVE\\love.exe"
// projectPath = "C:\\Users\\Trynda\\Desktop\\Dev\\Lua\\projects\\01-pong"
const proc = spawn(loveExePath, [projectPath], {
  shell: false,
  windowsHide: false,
});
proc.stdout.on('data', (buf) => handleOutput('stdout', buf.toString()));
proc.stderr.on('data', (buf) => handleOutput('stderr', buf.toString()));
proc.on('close', (code) => handleOutput('info', `Process exited (${code})`));
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

### chokidar Watch on Windows NTFS (v4 API)
```javascript
// Source: chokidar README (v4 — glob removed, directory path required)
import chokidar from 'chokidar';

// projectPath is a Windows path: C:\Users\...\projects\01-pong
const watcher = chokidar.watch(projectPath, {
  usePolling: false,    // Windows NTFS native events; no WSL2 9P issue on this machine
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
import fs from 'node:fs';
import path from 'node:path';

function streamLoveFile(projectPath, projectName, res) {
  const ig = ignore();
  const ignorePath = path.join(projectPath, '.loveignore');
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
| CodeMirror 6 for Lua editing | Monaco Editor (VS Code's editor) | — (user decision) | Monaco has built-in Lua; requires worker bundling; much better LSP integration story |
| Monaco AMD loader (require.js) | Monaco ESM bundled with esbuild | AMD deprecated in monaco-editor | AMD integration is deprecated; new projects must use ESM bundling |
| Single `editor.bundle.js` | `editor.bundle.js` + `editor.worker.js` separately | Monaco v0.22+ | Workers must be separate files; IIFE format + `MonacoEnvironment.getWorkerUrl` required |
| `window.monaco` global | `window.MonacoIDE.monaco` (explicit globalName) | Monaco ESM v0.22+ | `window.monaco` no longer defined by default; use explicit esbuild `globalName` |
| Node.js in WSL, wslpath for paths | Node.js on Windows native, direct Windows paths | Phase 3 platform decision | No wslpath; no usePolling required; simpler path handling throughout |
| chokidar with usePolling (WSL2) | chokidar without usePolling (Windows NTFS) | Platform switch to Windows | Windows NTFS has native file events; polling is unnecessary overhead |
| `@marimo-team/codemirror-languageserver` | `monaco-languageclient` v10 + `vscode-ws-jsonrpc` | Editor switch to Monaco | Monaco uses its own LSP client ecosystem; marimo package is CodeMirror-specific |
| chokidar v4 (CJS+ESM) | chokidar v5 (ESM-only, Node 20+) | November 2025 | Use v4 if targeting Node 18; use v5 only if Node 20+ is confirmed |

**Deprecated/outdated in this project's context:**
- `wslpath -w`: Not applicable — server is Windows-native Node.js
- `usePolling: true` in chokidar: Not needed on Windows NTFS
- AMD loader (`loader.js`): Deprecated in monaco-editor; do not start new projects with it
- `@marimo-team/codemirror-languageserver`: CodeMirror-specific; irrelevant now that editor is Monaco
- `arnoson/codemirror-lua`: CodeMirror-specific; irrelevant

---

## Open Questions

1. **lua-language-server binary location on Windows**
   - What we know: lua-language-server is the chosen LSP; it must be a Windows binary since the server runs on Windows
   - What's unclear: Whether lua-language-server is already installed on this Windows machine, and what the install path is
   - Recommendation: Wave 0 task should check for an existing install and document the path in `ide/config.json` as `lsPath`; provide install instructions (e.g., download from `luals.github.io`)

2. **love.exe path in config.json**
   - What we know: Phase 1 established love.exe at `C:\Program Files\LOVE\love.exe`; a WSL alias exists but the actual Windows path is needed
   - What's unclear: Whether Phase 1 stored this path in any file the IDE server can read directly
   - Recommendation: `ide/config.json` (gitignored) with `lovePath`, `projectPath`, `lsPath` fields; fallback to env vars `LOVE_PATH`, `PROJECT_PATH`, `LS_PATH`

3. **monaco-languageclient v10 and esbuild compatibility**
   - What we know: TypeFox uses Vite internally; docs state packages are ESM-only; esbuild has a known issue with `import.meta.url` in some contexts
   - What's unclear: Whether `monaco-languageclient` v10 can be bundled with plain esbuild (no Vite) without workarounds
   - Recommendation: During Wave 0, attempt the esbuild bundle. If `import.meta.url` issues arise, fall back to using `vscode-ws-jsonrpc` on the server side alone and wiring a minimal JSON-RPC client directly on the browser side using raw `WebSocket` + `MonacoLanguageClient` with manual transports.

4. **LSP on mobile Chrome**
   - What we know: Mobile tab-switching UI exists; editor panel has its own tab
   - What's unclear: Whether WebSocket-based LSP connection survives mobile Chrome tab-switching (background tab throttling)
   - Recommendation: Acceptable for LSP to disconnect/reconnect on mobile tab switches; not a blocking concern for v0.1

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
| IDE-01 | Server starts and binds 0.0.0.0:3000, serves index.html | smoke | `node --test ide/tests/server.test.js` | ❌ Wave 0 |
| IDE-02 | GET /api/files returns directory tree JSON | unit | `node --test ide/tests/files.test.js` | ❌ Wave 0 |
| IDE-03 | GET /api/files/:path returns file content | unit | `node --test ide/tests/files.test.js` | ❌ Wave 0 |
| IDE-04 | editor.bundle.js and editor.worker.js exist and are non-empty | smoke | `node -e "require('fs').statSync('ide/public/editor.bundle.js'); require('fs').statSync('ide/public/editor.worker.js')"` | ❌ Wave 0 |
| IDE-05 | POST /api/run spawns process; POST /api/stop kills it | manual-only | N/A — requires love.exe and Windows display | manual |
| IDE-06 | SSE /api/console/stream sends data events | unit | `node --test ide/tests/console.test.js` | ❌ Wave 0 |
| IDE-07 | File save triggers watcher callback within 500ms (Windows NTFS) | unit | `node --test ide/tests/watcher.test.js` | ❌ Wave 0 |
| IDE-08 | linkifyErrors() converts lua:line to anchor tags | unit | `node --test ide/tests/error-parser.test.js` | ❌ Wave 0 |
| IDE-09 | GET /api/export returns valid ZIP with project files | unit | `node --test ide/tests/export.test.js` | ❌ Wave 0 |

IDE-05 is manual-only because it requires a running Windows display, love.exe, and a real project path — not automatable from the WSL Claude Code environment.

### Sampling Rate
- **Per task commit:** `node --test ide/tests/*.test.js`
- **Per wave merge:** `node --test ide/tests/*.test.js`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `ide/tests/server.test.js` — covers IDE-01 (server binds and serves index.html)
- [ ] `ide/tests/files.test.js` — covers IDE-02, IDE-03 (file tree and read endpoints)
- [ ] `ide/tests/console.test.js` — covers IDE-06 (SSE emits data events)
- [ ] `ide/tests/watcher.test.js` — covers IDE-07 (chokidar fires callback on Windows NTFS)
- [ ] `ide/tests/error-parser.test.js` — covers IDE-08 (regex linkification)
- [ ] `ide/tests/export.test.js` — covers IDE-09 (archiver produces valid zip)
- [ ] `ide/package.json` — Node.js project manifest with test script
- [ ] `ide/public/editor.bundle.js` + `ide/public/editor.worker.js` — built by esbuild Wave 0 build step; covers IDE-04
- [ ] `ide/config.json` (gitignored template) — `lovePath`, `projectPath`, `lsPath` fields

---

## Sources

### Primary (HIGH confidence)
- `microsoft/monaco-editor` GitHub (main branch) — `src/basic-languages/lua/` directory confirmed; Lua is a built-in language; `docs/integrate-esm.md` — ESM bundling with esbuild; MonacoEnvironment.getWorkerUrl pattern; issue #2411 — esbuild integration confirmed by maintainers
- `TypeFox/monaco-languageclient` GitHub — v10.7.0 (Feb 2026); vscode-ws-jsonrpc v3.5.0; WebSocket-to-LSP-stdio proxy architecture confirmed
- `nodejs.org/api/child_process.html` — spawn vs exec; stdout streaming; Windows process kill behavior
- `paulmillr/chokidar` GitHub README — v4 breaking changes (glob removal); v5 ESM-only; Windows NTFS native events

### Secondary (MEDIUM confidence)
- `brijeshb42/monaco-themes` GitHub — available themes list; defineTheme/setTheme API confirmed via WebFetch
- `archiverjs/node-archiver` GitHub — streaming ZIP to HTTP response
- `kaelzhang/node-ignore` GitHub — gitignore-spec compliant pattern matching
- TypeFox blog post on monaco-languageclient v10 — ESM-only confirmed; v10 is a "toolbox" with sub-exports; Vite is TypeFox's internal tool, not a user requirement
- WebSearch on Monaco mobile issues — GitHub issues #1504, #4622 confirm limited touch support; no official fix as of 2026

### Tertiary (LOW confidence)
- Love2D forums (error format patterns) — error output format inferred from community examples; no official stderr spec documented
- WebSearch on chokidar Windows behavior — Windows NTFS native events expected; confirmed by chokidar README but not independently verified on this specific machine

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against official GitHub/npm; versions confirmed
- Architecture: HIGH — patterns derived from official docs and established Node.js idioms
- Monaco worker bundling: MEDIUM — core pattern (separate worker + MonacoEnvironment) is correct per official docs; exact esbuild compatibility with monaco-languageclient v10 needs Wave 0 verification (Open Question 3)
- LSP wiring: MEDIUM — monaco-languageclient v10 is the correct package; vscode-ws-jsonrpc handles framing; exact v10 API surface needs verification during implementation
- Platform (Windows-native Node.js): HIGH — confirmed by CONTEXT.md; eliminates wslpath and usePolling requirements entirely
- Pitfalls: HIGH — Windows kill/SIGTERM behavior, Monaco worker requirement, and chokidar v4 glob removal are well-documented across multiple sources

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (monaco-languageclient and monaco-editor are active packages; re-check if > 30 days)
