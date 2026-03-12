# Project Research Summary

**Project:** Love2D Game Engine/IDE
**Domain:** Developer tooling — game IDE wrapping an existing game runtime
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

This project is a purpose-built IDE for Love2D game development, structured around completing CS50G assignments (Pong through Pokemon) while simultaneously building the tooling needed to support each project type. The core insight is that the IDE is a thin Electron wrapper around an existing, fully capable game runtime — Love2D handles all game execution, rendering, and physics. The IDE's job is to manage files, launch the runtime, capture output, and eventually provide visual editors for the types of assets the CS50G projects require. This architecture is clean, achievable, and avoids the fatal mistake of reinventing what Love2D already provides.

The recommended approach is an Electron shell with a single BrowserWindow, CodeMirror 6 for code editing, chokidar for file watching, and Love2D launched as a child process via `child_process.spawn`. This stack is lightweight, well-documented, and maps directly to the required features. The learning path and IDE build path are tightly coupled: each CS50G game reveals what tooling is actually painful, and the IDE is extended to address that pain. This means the roadmap must interleave game completion with IDE feature work — not build the IDE first, then do games.

The primary risks are environmental (Windows Love2D setup, ADB for Android) and architectural discipline (not letting the project drift into building a game engine or framework). Both are avoidable with upfront setup verification and a strict rule: IDE code lives in `ide/` (JavaScript), game code lives in `projects/` (Lua). Scope creep toward visual editors before the corresponding game is completed is the most likely failure mode in later phases.

## Key Findings

### Recommended Stack

The IDE layer is Electron with vanilla HTML/CSS/JS (no React/Vue for v0.1 — add later if warranted), CodeMirror 6 for the Lua editor, and chokidar 3.x for file watching. All Electron IPC must use the `contextBridge + preload.js` pattern — `nodeIntegration: true` is a hard no. Love2D 11.5 is the target runtime, installed from the stable PPA. Game libraries (bump.lua, anim8, STI, push.lua) are vendored into each project's `lib/` directory — no LuaRocks for runtime dependencies.

The single most important compatibility fix: update `push.lua` from Ulydev/push master branch in every CS50G project to replace the deprecated `getPixelScale()` call with `getDPIScale()`. This is the only breaking change between CS50G's target (Love2D 0.10.x) and 11.5 for most projects.

**Core technologies:**
- Electron (latest stable): IDE shell — cross-platform desktop, Node.js backend for file ops
- CodeMirror 6: Code editor — lightweight, extensible, Lua mode available, smaller bundle than Monaco
- chokidar 3.x: File watching — reliable cross-platform, with debounce for WSL2 filesystem event storms
- child_process.spawn: Love2D process management — clean separation, kill+restart = live reload
- bump.lua 3.1: AABB collision — covers Pong through Zelda without needing Box2D
- STI (Simple Tiled Implementation): Tilemap loading — essential for Mario/Zelda projects
- anim8: Sprite sheet animation — simple API, widely used in Love2D ecosystem
- love-android APK + ADB: Android deployment — .love file push is instant; full Gradle APK build is weeks of work

### Expected Features

The feature dependency chain is strict: the IDE shell must exist before anything else can be built. Live reload is the highest-value feature after basic run/console — it dramatically improves the game development loop. Visual editors (tilemap, scene, physics body) are high-complexity features that belong in later phases, after the corresponding CS50G game has been completed and the pain points are understood firsthand.

**Must have (table stakes):**
- Project file tree — navigate and open files
- Lua syntax highlighting editor (CodeMirror 6) — basic editing
- One-click run game — launch Love2D from IDE
- Console output capture — see print() and errors
- Live reload on save — core developer experience improvement
- Error display with click-to-navigate — click error to jump to file:line
- Project creation from template — scaffold standard structure

**Should have (competitive differentiators):**
- Integrated Android deployment (ADB wrapper) — one-click deploy to phone
- Asset/sprite preview panel — browse game assets in IDE
- Game state inspector — view/modify game variables at runtime
- Hot reload without restart — change code, see results without full restart
- Animation timeline editor — visual tween editing

**Defer to v2+:**
- Visual tilemap editor (build after completing Mario project)
- Scene/room editor (build after completing Zelda project)
- Physics body editor (build after completing Angry Birds project)
- Dialogue editor (build after completing Pokemon project)
- Performance profiler

### Architecture Approach

The architecture is a three-layer system: Electron main process (file I/O, process management, file watching, ADB), Electron renderer/BrowserWindow (file tree, code editor, console panel, visual editors), and the Love2D child process (game execution, piped stdout/stderr back to Electron). The main process is intentionally thin — logic lives in preload and renderer where possible. A single BrowserWindow with resizable panels is correct for v0.1; multi-window adds IPC complexity with no benefit.

**Major components:**
1. Electron Main Process — file system, Love2D lifecycle, chokidar watching, ADB deployment
2. Electron Renderer — all UI: file tree, CodeMirror editor, console panel, asset preview, future visual editors
3. Love2D Child Process — game execution; communicates with IDE via stdout/stderr only (initially)

### Critical Pitfalls

1. **Love2D version incompatibility (CS50G)** — Update push.lua from Ulydev/push master in every project; test immediately after cloning. This affects Phase 1 setup.
2. **Windows Love2D not on PATH** — Verify love.exe is installed on Windows and callable. Create WSL alias for CLI convenience. No WSLg dependency — everything runs Windows-native.
3. **Zombie Love2D processes** — Use `tree-kill` or `process.kill(-pid)` on reload/quit; handle Electron `will-quit` to clean up all children. Detached: false only.
4. **chokidar event storms on WSL2** — Debounce 300-500ms, filter to Lua files only, use polling mode for `/mnt/c/...` paths where inotify doesn't cross the 9P boundary.
5. **Scope creep into game engine territory** — If a feature could be a standalone Lua library, it is not an IDE feature. Every IDE iteration must produce developer-facing UI, not runtime abstractions.
6. **Premature visual editors** — Never plan a visual editor before the corresponding CS50G game is complete. The game reveals what's actually painful; the editor addresses real pain.

## Implications for Roadmap

Based on combined research, the roadmap must strictly interleave game completion with IDE feature development. The suggested structure is eight paired phases (game + IDE feature), preceded by an environment setup phase.

### Phase 1: Environment and Foundation
**Rationale:** Nothing else works without a verified Windows-native Love2D setup. This is the highest-risk phase for invisible failures.
**Delivers:** Working Windows-native Love2D installation, push.lua compatibility fix verified, display/audio confirmed, project template established
**Addresses:** P1 (version compat), P9 (project structure drift)
**Avoids:** Discovering environment issues mid-game-build

### Phase 2: Pong + IDE Shell
**Rationale:** Pong is the simplest CS50G project (pure rectangles, no assets). Building it first provides a real project to drive IDE shell development.
**Delivers:** Working Pong game + Electron shell with file tree, run button, console output capture
**Uses:** Electron, child_process.spawn, basic HTML/CSS/JS
**Implements:** Electron Main Process + Renderer (basic), Love2D Child Process pattern
**Avoids:** P3 (process management), P8 (Electron security — contextBridge from day one)

### Phase 3: Flappy Bird + Live Reload
**Rationale:** Flappy Bird introduces sprites and scrolling — real asset management. Live reload becomes essential at this complexity level.
**Delivers:** Flappy Bird game + CodeMirror 6 editor + chokidar live reload + error click-to-navigate
**Uses:** CodeMirror 6, chokidar 3.x (with debounce and polling for WSL2)
**Implements:** Live Reload Flow, Error Capture Flow
**Avoids:** P4 (file watcher storms)

### Phase 4: Breakout + Asset Browser
**Rationale:** Breakout introduces state machines and more assets. The asset preview panel addresses the real pain of switching to a file explorer to check sprites.
**Delivers:** Breakout game + sprite/asset preview panel in IDE
**Uses:** Image rendering in Electron renderer
**Research flag:** Asset preview rendering across platforms may need investigation

### Phase 5: Match-3 + Android Deployment
**Rationale:** Match-3 is polished enough to demo on a phone. Android deployment is medium complexity and pays off across all subsequent projects.
**Delivers:** Match-3 game + one-click ADB deploy button
**Uses:** Windows ADB alias in WSL2, zip → .love packaging
**Implements:** Android Deploy Flow
**Avoids:** P5 (ADB in WSL2 — alias approach is correct, document it)

### Phase 6: Mario + Tilemap Editor
**Rationale:** Mario is the first project that genuinely requires tilemap tooling. Only after completing Mario with raw Tiled/text files will the pain points of a tilemap editor be clear.
**Delivers:** Mario platformer + visual tilemap editor in IDE
**Uses:** STI, Tiled-compatible format, Canvas-based editor in renderer
**Research flag:** Visual tilemap editor is "Very High" complexity — needs dedicated phase research before building
**Avoids:** P7 (premature visual editor — Mario must be completed first)

### Phase 7: Zelda + Scene Editor
**Rationale:** Zelda introduces rooms/entities. The scene editor is the natural next visual tool after tilemap editing is proven.
**Delivers:** Zelda top-down game + scene/room editor with entity drag-and-drop
**Uses:** Canvas editor extension from Phase 6
**Research flag:** Scene editor and entity system design needs research

### Phase 8: Angry Birds + Physics Editor
**Rationale:** Angry Birds is the only CS50G project using love.physics (Box2D). Physics body editing is only relevant here.
**Delivers:** Angry Birds game + physics body editor
**Uses:** love.physics, Box2D visualization
**Research flag:** Physics body visualization in Electron renderer is niche — needs research

### Phase 9: Pokemon + Dialogue Editor + Polish
**Rationale:** Pokemon is the most complex CS50G project (dialogue, overworld, data). The dialogue editor is the capstone IDE visual tool.
**Delivers:** Pokemon-style RPG + dialogue tree editor + IDE polish pass
**Research flag:** Dialogue/tree graph editor UI needs research

### Phase Ordering Rationale

- Environment must come first — silent failures in Windows/Love2D setup derail everything downstream
- Game phases strictly precede their corresponding IDE visual editor features (P7 pitfall prevention)
- Live reload (Phase 3) is front-loaded because it has the highest daily-use ROI
- Android deployment (Phase 5) is placed at Match-3 because that's the first "showable" game
- Visual editors are ordered by complexity: tilemap (Phase 6) is the foundation for scene editing (Phase 7)
- Hot reload and game state inspector are not assigned to a specific phase — they emerge naturally in Phase 6-7 when restart cycle pain peaks

### Research Flags

Phases needing deeper research during planning:
- **Phase 6 (Tilemap Editor):** Very High complexity rating; Canvas-based editor with Tiled-compatible output needs API and UX research before implementation
- **Phase 7 (Scene Editor):** Entity system design and drag-and-drop canvas editor patterns need research
- **Phase 8 (Physics Editor):** Box2D shape visualization in Chromium renderer is niche; sparse prior art
- **Phase 9 (Dialogue Editor):** Tree/graph UI components for dialogue trees need research

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 2 (IDE Shell):** Electron + child_process.spawn is thoroughly documented
- **Phase 3 (Live Reload):** chokidar + debounce pattern is well-established; WSL2 polling workaround is documented
- **Phase 5 (Android Deploy):** ADB wrapper via Windows alias is a known pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies (Electron, CodeMirror 6, chokidar, Love2D 11.5) are well-established; version choices are specific and justified |
| Features | HIGH | Feature dependency chain is logical; complexity ratings are realistic; anti-features list prevents scope creep |
| Architecture | HIGH | Three-layer architecture is clean and proven; IPC pattern (contextBridge) is the current Electron best practice |
| Pitfalls | HIGH | Platform-specific pitfalls (Windows Love2D paths, ADB, chokidar polling on WSL2 mounts) are specific and actionable; CS50G compatibility issue is precisely identified |

**Overall confidence:** HIGH

### Gaps to Address

- **Hot reload implementation details:** The Lua-side reload coordinator design is noted as "later" but the exact protocol (socket vs. file-based) is not specified. Needs design work before Phase 6.
- **CodeMirror 6 Lua mode quality:** Noted as "available" but quality relative to VS Code's Lua LSP is unknown. May need validation during Phase 3.
- **Animation timeline editor complexity:** Rated "High" in features but has no architecture notes. If this surfaces as needed before the defer list, it needs research.
- **Project template finalization:** The standard structure (main.lua, conf.lua, lib/, assets/, src/) must be locked in Phase 1 before any IDE file-tree code is written that depends on it.

## Sources

All research is based on direct analysis of the Love2D ecosystem, CS50G curriculum, Electron documentation, and established community patterns. No external URLs were retrieved during this research pass — findings reflect expert synthesis of known ecosystem state.

### Primary (HIGH confidence)
- Love2D 11.5 official API — compatibility with CS50G 0.10.x code
- Electron contextBridge documentation — IPC security pattern
- Ulydev/push repository — push.lua getDPIScale fix
- chokidar documentation — WSL2 polling workaround

### Secondary (MEDIUM confidence)
- CS50G curriculum structure — learning path alignment with IDE feature phases
- Love2D community (bump.lua, anim8, STI) — library recommendations

### Tertiary (LOW confidence)
- Hot reload via Lua debug module — documented as a pattern but implementation details need validation
- Visual editor complexity ratings — estimated based on comparable tools, not built prior art

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
