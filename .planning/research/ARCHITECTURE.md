# Architecture Research: Love2D Game Engine/IDE

## System Overview

The IDE is an Electron application that manages and launches Love2D game projects. The key architectural challenge is the boundary between two runtimes: Node.js (IDE) and LuaJIT (game).

```
┌─────────────────────────────────────────────┐
│ Electron (Main Process)                      │
│  ├── File system operations                  │
│  ├── Project management                      │
│  ├── Love2D process lifecycle                │
│  ├── File watcher (chokidar)                 │
│  └── ADB deployment                          │
├─────────────────────────────────────────────┤
│ Electron (Renderer / BrowserWindow)          │
│  ├── File tree panel                         │
│  ├── Code editor (CodeMirror 6)              │
│  ├── Console output panel                    │
│  ├── Asset preview panel (later)             │
│  └── Visual editors (later phases)           │
├─────────────────────────────────────────────┤
│ Love2D Process (child_process.spawn)         │
│  ├── Game code (Lua)                         │
│  ├── stdout/stderr → piped to Electron       │
│  └── Optional: debug socket (later)          │
└─────────────────────────────────────────────┘
```

## Component Boundaries

### 1. Electron Main Process
- **Owns:** File I/O, process management, system integration
- **Talks to:** Renderer via IPC (contextBridge), Love2D via spawn/stdio
- **Pattern:** Thin main process. Logic in preload + renderer where possible.

### 2. Electron Renderer
- **Owns:** All UI rendering, user interaction
- **Talks to:** Main process via contextBridge API
- **Pattern:** Single BrowserWindow with panel layout (sidebar + editor + bottom panel)

### 3. Love2D Game Process
- **Owns:** Game execution, rendering, input
- **Talks to:** Electron only via stdout/stderr initially
- **Pattern:** Launched as child process. Killed and respawned on reload.

## Data Flow

### Live Reload Flow
```
File saved → chokidar detects change → Main process notified
  → Kill Love2D process → Respawn Love2D process
  → Renderer updates console ("Reloaded")
```

### Error Capture Flow
```
Love2D crashes → stderr captured by spawn pipe
  → Main process parses error (file:line pattern)
  → IPC to renderer → Error panel shows clickable error
  → Click → Editor navigates to file:line
```

### Android Deploy Flow
```
User clicks "Deploy" → Main packages .love (zip)
  → Main runs adb push → Main runs adb shell am start
  → Renderer shows deploy status
```

## IPC Design

```javascript
// preload.js — expose safe API to renderer
contextBridge.exposeInMainWorld('ide', {
  // File operations
  readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
  readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
  writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),

  // Game lifecycle
  runGame: (projectPath) => ipcRenderer.invoke('game:run', projectPath),
  stopGame: () => ipcRenderer.invoke('game:stop'),

  // Events from main
  onConsoleOutput: (cb) => ipcRenderer.on('game:stdout', (_, data) => cb(data)),
  onGameError: (cb) => ipcRenderer.on('game:error', (_, data) => cb(data)),
  onFileChange: (cb) => ipcRenderer.on('fs:changed', (_, path) => cb(path)),

  // Deploy
  deployToAndroid: (projectPath, name) => ipcRenderer.invoke('deploy:android', projectPath, name),
});
```

## Key Architecture Decisions

### Why Electron over Tauri?
- Node.js ecosystem (npm packages for file watching, process management)
- Chromium for UI (familiar web tech for panels, editors)
- Love2D is the performance-critical part, not the IDE shell
- Tauri's Rust backend adds complexity without benefit here

### Why spawn Love2D as child process (not embed)?
- Love2D has its own window and rendering pipeline
- Embedding would require deep C/C++ integration
- Child process gives clean separation: kill + restart = live reload
- Later: could use a debug socket for hot reload without restart

### Why single BrowserWindow with panels (not multi-window)?
- Simpler state management
- Panels can resize/collapse
- Multi-window Electron apps have IPC complexity
- Most game IDEs use single-window layouts

## Suggested Build Order

1. **Electron shell** — Main process, single window, basic HTML
2. **File tree** — Read directory, display tree, click to select
3. **Run game** — Spawn Love2D, capture stdout
4. **Console panel** — Display stdout/stderr in bottom panel
5. **Code editor** — CodeMirror 6 in main panel, open files from tree
6. **Live reload** — chokidar watches project dir, restart on change
7. **Error parsing** — Regex Love2D errors, click-to-navigate
8. **Android deploy** — ADB wrapper, one-click deploy button

## Future Architecture (Post-v0.1)

### Hot Reload (Phase 3+)
Instead of kill+restart, inject a Lua debug module that reloads changed modules at runtime. Requires:
- A Lua-side "reload coordinator" that Love2D loads at startup
- A socket or file-based protocol between Electron and Love2D
- Careful handling of state preservation during reload

### Game State Inspector (Phase 3+)
- Love2D game includes a debug module that serializes state
- Electron reads state via socket/file and displays in panel
- Two-way: Electron can write values back

### Visual Editors (Phase 5+)
- Canvas-based editors in Electron renderer
- Output Lua data files that Love2D loads
- Tile maps, entity placements, physics shapes all stored as Lua tables or JSON
