# Phase 3: Web IDE - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

A web-based IDE served by a Node.js server, accessible over local WiFi from any browser (including mobile Chrome). Developer can browse project files, edit Lua code with syntax highlighting and LSP support, run a Love2D game on the host, see console output in real time, benefit from automatic live reload on save, navigate to errors, and export the project as a .love file.

</domain>

<decisions>
## Implementation Decisions

### Panel layout
- VS Code style: sidebar file tree left, Monaco editor center, console panel bottom
- Top toolbar bar with project name, Run button, Export button, and status indicators
- All panel dividers are resizable by dragging
- On mobile Chrome: tab-switching UI — show one panel at a time (files, editor, console) with tabs to switch between them

### Run behavior
- Run button kills any existing Love2D process and relaunches fresh (kill+restart)
- Server spawns Windows `love.exe` as child process (love.exe path established in Phase 1)
- Console clears on each restart — only shows output from the current session

### Live reload
- Editor save writes the file AND immediately triggers game restart (full process kill+restart)
- chokidar filesystem watch also detects external edits (e.g., from VS Code) and triggers restart
- Both paths coexist — editor save for instant feedback, chokidar for external edit coverage
- 300-500ms debounce; usePolling: false (server runs Windows-native, NTFS events work — polling only needed if running from WSL)

### Error display
- Love2D errors appear in console panel with file:line as clickable links
- Clicking an error link opens the file at that line in the editor
- Game process stays stopped on error — user reads error, fixes code, then manually clicks Run or saves to trigger reload (no auto-retry on error)

### Editor
- Monaco Editor (VS Code's editor component) — not CodeMirror
- Custom theme: Catpuccin with vibrant accent colors (not muted defaults)
- Dark mode: Catpuccin Mocha / Light mode: Catpuccin Latte — toggle switch in toolbar
- Port from https://github.com/catppuccin/vscode — same token color format works since Monaco is VS Code's editor
- Theme applies to the entire IDE shell (file tree, console, toolbar), not just the editor
- Monaco has built-in LSP protocol support — wire LuaLS/lua-language-server through it

### Lua LSP
- Must-have for Phase 3 — real-time syntax errors, autocomplete, and diagnostics in the editor
- Use LuaLS/lua-language-server with Monaco's built-in LSP support
- Monaco handles the language client side natively

### .love export
- Export button in the top toolbar
- Server-side zip of the project directory, browser downloads the .love file
- Export respects a `.loveignore` file in the project root (similar to .gitignore format) for excluding files
- Browser download only — no extra files saved to project directory

### Claude's Discretion
- Exact vibrant accent color choices for the Catpuccin Mocha theme (which tokens get which accents)
- Node.js server framework choice (Express, Koa, plain http, etc.)
- WebSocket vs SSE for real-time console streaming
- File tree component implementation details
- .loveignore parsing implementation (glob library choice)
- Mobile tab-switching UI design details
- Monaco-to-LuaLS wiring approach (monaco-languageclient or similar)

</decisions>

<specifics>
## Specific Ideas

- IDE must be accessible from mobile Chrome over WiFi — this is a hard requirement, not nice-to-have
- Vanilla HTML/CSS/JS for v0.1 — no React/Vue framework (decided in Phase 1 context)
- Everything runs on Windows natively — Node.js server, Love2D, filesystem. WSL is only used for Claude Code
- Love2D is spawned as a Windows native process (love.exe), not inside WSL

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `projects/_template/`: Standard project structure (main.lua, conf.lua, lib/, assets/, src/) — IDE should understand this layout
- `projects/00-test/`: Minimal Love2D test project — good for testing Run functionality
- `projects/01-pong/`: Active project with real game code — primary test target for the IDE

### Established Patterns
- Love2D runs as `love.exe` on Windows — WSL alias exists to call it from WSL
- chokidar polling mode required for WSL2 cross-9P-boundary file watching
- Project template convention: lib/ for libraries, assets/ for media, src/ for game code

### Integration Points
- `ide/` directory exists (empty with .gitkeep) — IDE code lives here
- WSL love.exe alias from Phase 1 — server uses this to spawn game processes
- Phase 5 will add browser preview (love.js) and Android deploy button to this IDE

</code_context>

<deferred>
## Deferred Ideas

- Lua LSP with Love2D API type definitions/annotations — research what's available, but full API coverage may be a future enhancement
- In-browser game preview via love.js — Phase 5
- One-click Android deploy button — Phase 5

</deferred>

---

*Phase: 03-web-ide*
*Context gathered: 2026-03-12*
