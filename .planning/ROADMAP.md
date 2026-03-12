# Roadmap: Love2D Game Engine/IDE

## Overview

This milestone ships the foundation: a verified Love2D development environment, a complete Pong game built from scratch, an Electron-based IDE shell that can run and edit Love2D projects with live reload, and deployment paths to both the browser (love.js) and Android (ADB). Each phase delivers a coherent, verifiable capability — nothing is left half-done at a phase boundary.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Environment** - Windows-native Love2D 11.5, display/audio, workspace, and ADB fully verified and ready
- [ ] **Phase 2: Pong** - Complete Pong game rebuilt from scratch including AI paddle assignment
- [ ] **Phase 3: IDE Shell** - Electron app with file tree, Lua editor, run button, console, live reload, and .love export
- [ ] **Phase 4: Preview and Deploy** - Browser preview via love.js and one-click Android deployment via ADB

## Phase Details

### Phase 1: Environment
**Goal**: Developer can run a Love2D game natively on Windows with display and audio working, course repos are accessible, and workspace structure is established
**Depends on**: Nothing (first phase)
**Requirements**: ENV-01, ENV-02, ENV-03, ENV-04, ENV-05, ENV-06, ENV-07
**Success Criteria** (what must be TRUE):
  1. Running Windows `love.exe --version` prints `11.5.x` and a test project opens a window with sound natively on Windows
  2. CS50G reference repos for all 8 Love2D projects are cloned and browsable under workspace `course/`
  3. push.lua compatibility fix is applied and a CS50G project that uses push.lua launches without errors on Love2D 11.5
  4. Windows ADB platform-tools installed and `adb devices` works (callable from WSL via alias to adb.exe)
  5. Workspace directories `course/`, `projects/`, and `ide/` exist on Windows filesystem with the standard project template in place
**Plans:** 2/3 plans executed

Plans:
- [x] 01-01-PLAN.md — Install Love2D 11.5, Lua tooling in WSL, create test project, verify display + audio on Windows
- [x] 01-02-PLAN.md — Clone CS50G repos, create workspace structure, build project template with patched push.lua
- [ ] 01-03-PLAN.md — Configure Windows ADB with WSL alias, end-to-end Android deployment test

### Phase 2: Pong
**Goal**: A complete, independently-written Pong game exists with working AI paddle, establishing the project template all future games will follow
**Depends on**: Phase 1
**Requirements**: PONG-01, PONG-02, PONG-03, PONG-04, PONG-05
**Success Criteria** (what must be TRUE):
  1. CS50G Pong lecture code has been studied and can be explained (game loop, collision, state management)
  2. Pong runs from `projects/01-pong/` with ball physics, paddle input, collision detection, and score display
  3. AI-controlled paddle mode is implemented and the game is completable against the AI
  4. Standard project template (`main.lua`, `conf.lua`, `lib/`, `assets/`, `src/`) is established and documented
**Plans**: TBD

Plans:
- [ ] 02-01: Study CS50G Pong lecture code and document understanding of core concepts
- [ ] 02-02: Rebuild Pong from scratch in `projects/01-pong/` with game loop, input, collision, and scoring
- [ ] 02-03: Complete the AI paddle assignment and finalize the standard project template

### Phase 3: IDE Shell
**Goal**: A working Electron IDE where a developer can browse project files, edit Lua code with syntax highlighting, run a Love2D game, see console output, and benefit from automatic live reload on save
**Depends on**: Phase 2
**Requirements**: IDE-01, IDE-02, IDE-03, IDE-04, IDE-05, IDE-06, IDE-07, IDE-08, IDE-09
**Success Criteria** (what must be TRUE):
  1. Electron app launches with sidebar, main editor, and bottom console panel visible in a single window
  2. Developer can open any file from the file tree into the CodeMirror editor with Lua syntax highlighting
  3. Clicking Run launches the Love2D game and its stdout/stderr output appears in the console panel in real time
  4. Saving a Lua file causes the game to automatically restart within one second (live reload)
  5. When Love2D reports an error, the IDE displays the file name and line number; developer can click it to navigate there
  6. Developer can export the current project as a `.love` file from inside the IDE
**Plans**: TBD

Plans:
- [ ] 03-01: Scaffold Electron app with single-window layout, contextBridge IPC, file tree panel, and project open/navigate
- [ ] 03-02: Integrate CodeMirror 6 Lua editor and wire file-open from tree into editor
- [ ] 03-03: Implement Love2D child process (spawn/kill), console output capture, error parsing, and live reload via chokidar
- [ ] 03-04: Add .love export (zip packaging) and end-to-end IDE integration test with Pong

### Phase 4: Preview and Deploy
**Goal**: Developer can preview the game in-browser without leaving the IDE and deploy it to an Android device with a single click
**Depends on**: Phase 3
**Requirements**: BRW-01, BRW-02, BRW-03, ADB-01, ADB-02, ADB-03
**Success Criteria** (what must be TRUE):
  1. Game runs in an embedded browser view inside the IDE (love.js), with no separate window required
  2. Developer can switch between native Love2D and browser preview via distinct run options
  3. Developer can package, push, and launch the game on a connected Android phone using a single Deploy button in the IDE
**Plans**: TBD

Plans:
- [ ] 04-01: Integrate love.js and wire browser preview panel with both native and browser run options
- [ ] 04-02: Implement ADB deploy flow (package .love, adb push, adb shell am start) with one-click button in IDE

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Environment | 2/3 | In Progress|  |
| 2. Pong | 0/3 | Not started | - |
| 3. IDE Shell | 0/4 | Not started | - |
| 4. Preview and Deploy | 0/2 | Not started | - |
