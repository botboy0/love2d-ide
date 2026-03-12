# Requirements: Love2D Game Engine/IDE

**Defined:** 2026-03-12
**Core Value:** The IDE must make Love2D game development faster and more visual than a text editor alone

## v1 Requirements

Requirements for initial release (Pong + IDE v0.1). Each maps to roadmap phases.

### Environment

- [x] **ENV-01**: Love2D 11.5 installed on Windows and verified working (`love --version` + render test with window and sound)
- [x] **ENV-02**: Lua 5.1, LuaJIT, and LuaRocks installed (WSL for CLI use)
- [x] **ENV-03**: Love2D opens a window with audio on Windows natively (no WSLg dependency)
- [x] **ENV-04**: CS50G repos (all 8 Love2D projects) cloned to workspace `course/` directory
- [x] **ENV-05**: push.lua compatibility fix applied for Love2D 11.x
- [x] **ENV-06**: Workspace directory structure created (`course/`, `projects/`, `ide/`) on Windows filesystem
- [x] **ENV-07**: Windows ADB platform-tools installed, accessible from WSL via alias to adb.exe

### Pong Game

- [x] **PONG-01**: CS50G Pong lecture code studied and understood
- [x] **PONG-02**: Pong rebuilt from scratch in `projects/01-pong/` (not forked)
- [ ] **PONG-03**: Game loop, input handling, collision detection, and scoring implemented
- [ ] **PONG-04**: CS50G "Pong — the AI Update" assignment completed (AI-controlled paddle)
- [x] **PONG-05**: Standard project template established (`main.lua`, `conf.lua`, `lib/`, `assets/`, `src/`)

### IDE Shell

- [x] **IDE-01**: Web IDE launches and is accessible over local WiFi from any browser (single-window layout: sidebar + main + bottom panels)
- [x] **IDE-02**: File tree panel displays project directory structure with expand/collapse
- [x] **IDE-03**: User can open files from file tree into code editor
- [x] **IDE-04**: Code editor panel with Lua syntax highlighting (Monaco Editor)
- [x] **IDE-05**: User can run Love2D game from IDE (server spawns native Love2D child process on host)
- [x] **IDE-06**: Console panel captures and displays Love2D stdout/stderr output
- [x] **IDE-07**: Live reload: game auto-restarts when Lua files are saved (debounced)
- [x] **IDE-08**: Error display: Love2D errors parsed and shown with file:line reference
- [x] **IDE-09**: User can export (download/package) project as .love file from IDE

### Browser Preview

- [ ] **BRW-01**: love.js integrated for in-browser Love2D game rendering
- [ ] **BRW-02**: User can preview game embedded in IDE window (browser-based, no separate window)
- [ ] **BRW-03**: Both native Love2D and browser preview available as run options

### Android Deployment

- [ ] **ADB-01**: User can package project as .love file and push to Android device via ADB
- [ ] **ADB-02**: User can launch game on Android phone via ADB intent
- [ ] **ADB-03**: One-click deploy button in IDE that packages, pushes, and launches on device

## v2 Requirements

Deferred to future milestones. Each unlocked by a CS50G game project.

### Flappy Bird + Asset Browser

- **FLAP-01**: Flappy Bird rebuilt from scratch
- **ASSET-01**: Asset browser panel with sprite/image preview
- **ASSET-02**: Drag-and-drop image into code

### Breakout + State Inspector

- **BREAK-01**: Breakout rebuilt from scratch
- **INSP-01**: Game state inspector (view/modify runtime variables)
- **INSP-02**: Hot reload without full restart

### Match 3 + Animation Editor

- **MATCH-01**: Match 3 rebuilt from scratch
- **ANIM-01**: Animation/tween timeline editor

### Mario + Tile Map Editor

- **MARIO-01**: Mario rebuilt from scratch
- **TILE-01**: Visual tile map editor (load/edit/save .tmx or Lua maps)

### Zelda + Scene Editor

- **ZELDA-01**: Zelda rebuilt from scratch
- **SCENE-01**: Scene/room editor with entity placement

### Angry Birds + Physics Editor

- **ANGRY-01**: Angry Birds rebuilt from scratch
- **PHYS-01**: Physics body shape editor (Box2D visual tool)

### Pokemon + Dialogue Editor

- **POKE-01**: Pokemon rebuilt from scratch
- **DIAL-01**: Dialogue tree editor
- **DATA-01**: Stats/data table editor

## Out of Scope

| Feature | Reason |
|---------|--------|
| Unity CS50G projects (9-11) | Love2D only for this milestone |
| Full APK build pipeline | .love push is sufficient; Gradle/NDK setup is weeks of work |
| Visual scripting / node editor | Lua is simple enough; massive complexity for minimal benefit |
| 3D support | Love2D is 2D only |
| Multiplayer/networking | CS50G doesn't cover it; out of scope |
| Asset store / marketplace | Community feature, not IDE core |
| Native desktop app wrapper | Web-based IDE is sufficient; Electron adds complexity without benefit |
| Built-in game engine runtime | Love2D IS the runtime; don't rewrite it |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 1 | Complete |
| ENV-02 | Phase 1 | Complete |
| ENV-03 | Phase 1 | Complete |
| ENV-04 | Phase 1 | Complete |
| ENV-05 | Phase 1 | Complete |
| ENV-06 | Phase 1 | Complete |
| ENV-07 | Phase 1 | Complete |
| PONG-01 | Phase 2 | Complete |
| PONG-02 | Phase 2 | Complete |
| PONG-03 | Phase 4 | Pending |
| PONG-04 | Phase 4 | Pending |
| PONG-05 | Phase 2 | Complete |
| IDE-01 | Phase 3 | Complete |
| IDE-02 | Phase 3 | Complete |
| IDE-03 | Phase 3 | Complete |
| IDE-04 | Phase 3 | Complete |
| IDE-05 | Phase 3 | Complete |
| IDE-06 | Phase 3 | Complete |
| IDE-07 | Phase 3 | Complete |
| IDE-08 | Phase 3 | Complete |
| IDE-09 | Phase 3 | Complete |
| BRW-01 | Phase 5 | Pending |
| BRW-02 | Phase 5 | Pending |
| BRW-03 | Phase 5 | Pending |
| ADB-01 | Phase 5 | Pending |
| ADB-02 | Phase 5 | Pending |
| ADB-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 — Phase mapping updated to 4-phase structure (BRW + ADB merged into Phase 4)*
