# Pitfalls Research: Love2D Game Engine/IDE

## P1: Love2D Version Compatibility (CS50G)

**Risk:** CS50G code was written for Love2D 0.10.x. Running on 11.5 causes runtime errors.

**Warning signs:**
- `attempt to call nil value 'getPixelScale'`
- Rendering looks wrong (scaling/resolution issues)
- Font rendering differences

**Prevention:**
- Update `push.lua` from Ulydev/push master branch in every CS50G project
- Test each project immediately after cloning
- Keep a compatibility notes file per project

**Phase:** Environment setup (Phase 1)

---

## P2: Windows Love2D Installation/PATH

**Risk:** Love2D runs natively on Windows (not in WSL). If love.exe isn't on PATH or the wrong version is installed, nothing works.

**Warning signs:**
- `love` not recognized in cmd/PowerShell
- Wrong Love2D version (not 11.5.x)
- WSL alias to love.exe not set up or pointing to wrong path

**Prevention:**
- Install Love2D 11.5 on Windows and add to system PATH
- Create WSL alias/wrapper to call Windows love.exe for CLI convenience
- Test `love.exe --version` on Windows AND via WSL alias with a simple test project
- No WSLg dependency — display and audio are handled natively by Windows

**Phase:** Environment setup (Phase 1)

---

## P3: Electron + Love2D Process Management

**Risk:** Love2D child processes not properly killed on reload/exit, leading to zombie processes or port conflicts.

**Warning signs:**
- Multiple Love2D windows appearing
- "Address already in use" errors
- Orphaned processes consuming CPU after IDE closes

**Prevention:**
- Use `child_process.spawn` with `detached: false`
- Kill process tree (not just parent) on reload: use `tree-kill` npm package or `process.kill(-pid)`
- Handle Electron `will-quit` event to clean up all child processes
- Set up signal handlers for SIGTERM/SIGINT

**Phase:** IDE v0.1 (Electron shell phase)

---

## P4: File Watcher Storms

**Risk:** chokidar fires multiple events for a single save (especially on WSL2 where filesystem events cross the Windows/Linux boundary). Causes rapid-fire reloads.

**Warning signs:**
- Game restarts 2-3 times per save
- Console floods with "Reloading..." messages
- Brief flicker/flash on every save

**Prevention:**
- Debounce file change events (300-500ms delay)
- Ignore non-Lua file changes (filter by extension)
- Ignore `.git/` and `node_modules/` directories
- WSL2-specific: use polling mode for Windows-mounted paths (`/mnt/c/...`) as inotify doesn't work across the 9P filesystem

**Phase:** IDE v0.1 (live reload feature)

---

## P5: ADB in WSL2

**Risk:** WSL2 doesn't see USB devices natively. ADB setup has multiple failure modes.

**Warning signs:**
- `adb devices` shows empty list
- "Permission denied" on USB device
- ADB version mismatch between Windows and WSL

**Prevention:**
- Use Windows ADB binary via alias (simplest): `alias adb='/mnt/c/platform-tools/adb.exe'`
- Ensure Windows ADB and WSL ADB aren't both running (port 5037 conflict)
- Kill any existing ADB server before starting: `adb kill-server && adb start-server`
- Alternative: usbipd-win for native USB passthrough (more complex but cleaner)

**Phase:** Android deployment setup

---

## P6: Scope Creep — Building an Engine Instead of an IDE

**Risk:** The natural temptation is to build game engine features (physics wrappers, entity systems, scene graphs) instead of IDE features. Love2D already IS the engine.

**Warning signs:**
- Writing Lua libraries instead of Electron UI
- Building abstractions over Love2D APIs
- "Helper" modules growing into framework-sized code
- Time spent on game architecture instead of developer tools

**Prevention:**
- Strict boundary: the IDE is a TOOL for Love2D, not a replacement
- IDE code lives in `ide/` (JavaScript/Electron), game code in `projects/` (Lua)
- If a feature could be a standalone Lua library, it's NOT an IDE feature
- Each IDE iteration should produce developer-facing UI, not runtime code

**Phase:** All phases (ongoing vigilance)

---

## P7: Premature Visual Editors

**Risk:** Building tile map editors, physics editors, etc. before understanding the domain from building actual games.

**Warning signs:**
- Planning a visual editor before completing the corresponding CS50G game
- Editor doesn't match actual game dev workflow
- Over-engineering editor features nobody needs

**Prevention:**
- Strict learning-first order: complete the CS50G game BEFORE building the corresponding IDE feature
- The game project reveals what's actually painful about text-only development
- Build the simplest editor that addresses real pain, not imagined features

**Phase:** IDE iteration phases (post-game completion)

---

## P8: Electron Security

**Risk:** Enabling `nodeIntegration: true` or `contextIsolation: false` for convenience, creating security vulnerabilities.

**Warning signs:**
- `require('fs')` used directly in renderer
- `nodeIntegration: true` in BrowserWindow options
- No preload script / contextBridge

**Prevention:**
- Always use contextBridge + preload.js pattern
- Main process handles all file I/O, renderer requests via IPC
- Never expose Node.js APIs directly to renderer
- This matters even for local tools — bad habits carry forward

**Phase:** IDE v0.1 (initial Electron setup)

---

## P9: Game Project Structure Drift

**Risk:** Projects in `projects/` diverge in structure, making it hard for the IDE to handle them uniformly.

**Warning signs:**
- Different projects have different entry points
- Assets in different locations per project
- No consistent `conf.lua` settings

**Prevention:**
- Establish a project template early (during Pong phase)
- Standard structure: `main.lua`, `conf.lua`, `lib/`, `assets/`, `src/`
- IDE project creation should scaffold this structure
- Document conventions in a `CONVENTIONS.md`

**Phase:** Pong game build phase
