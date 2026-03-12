# Roadmap: Love2D Game Engine/IDE

## Overview

This milestone ships the foundation: a verified Love2D development environment, a web-based IDE accessible over local WiFi, a complete Pong game built from scratch using that IDE, and deployment paths to both the browser (love.js) and Android (ADB). Each phase delivers a coherent, verifiable capability — nothing is left half-done at a phase boundary.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Environment** - Windows-native Love2D 11.5, display/audio, workspace, and ADB fully verified and ready (completed 2026-03-12)
- [x] **Phase 2: Pong Scaffold** - Project directory, assets, and pong-0 baseline verified (completed 2026-03-12)
- [ ] **Phase 3: Web IDE** - Node.js web server with file tree, Monaco Lua editor, run button, console, live reload, and .love export — accessible over local WiFi from any browser
- [ ] **Phase 4: Pong Rebuild** - Complete Pong game rebuilt from scratch using the Web IDE, including AI paddle assignment
- [ ] **Phase 5: Preview and Deploy** - Browser preview via love.js and one-click Android deployment via ADB

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
**Plans:** 3/3 plans complete

Plans:
- [x] 01-01-PLAN.md — Install Love2D 11.5, Lua tooling in WSL, create test project, verify display + audio on Windows
- [x] 01-02-PLAN.md — Clone CS50G repos, create workspace structure, build project template with patched push.lua
- [ ] 01-03-PLAN.md — Configure Windows ADB with WSL alias, end-to-end Android deployment test

### Phase 2: Pong Scaffold
**Goal**: Project directory with assets, libraries, and a verified pong-0 baseline ready for the incremental rebuild
**Depends on**: Phase 1
**Requirements**: PONG-01, PONG-02, PONG-05
**Success Criteria** (what must be TRUE):
  1. CS50G Pong lecture code has been studied
  2. `projects/01-pong/` exists with assets, libraries, conf.lua, and a working pong-0 main.lua
  3. Standard project template (`main.lua`, `conf.lua`, `lib/`, `assets/`, `src/`) is established
**Plans:** 1/1 plans complete

Plans:
- [x] 02-01-PLAN.md — Set up project directory from template, copy assets/libraries, initialize DEVLOG.md, create pong-0 baseline

### Phase 3: Web IDE
**Goal**: A web-based IDE accessible over local WiFi where a developer can browse project files, edit Lua code with syntax highlighting (Monaco Editor), run a Love2D game, see console output, and benefit from automatic live reload on save
**Depends on**: Phase 1
**Requirements**: IDE-01, IDE-02, IDE-03, IDE-04, IDE-05, IDE-06, IDE-07, IDE-08, IDE-09
**Success Criteria** (what must be TRUE):
  1. Node.js server launches and is accessible from any device on the local network (binds 0.0.0.0)
  2. Web UI has sidebar file tree, main Monaco editor, and bottom console panel
  3. Developer can open any file from the file tree into the Monaco editor with Lua syntax highlighting
  4. Clicking Run spawns the Love2D process on the host and stdout/stderr appears in the console panel in real time
  5. Saving a Lua file causes the game to automatically restart within one second (live reload)
  6. When Love2D reports an error, the IDE displays the file name and line number; developer can click it to navigate there
  7. Developer can export the current project as a `.love` file from the IDE
**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Server foundation, Monaco Editor bundle with Catppuccin theme, UI shell with file tree and mobile tabs
- [ ] 03-02-PLAN.md — Game execution: Run/Stop, console streaming, live reload, error display with clickable links
- [ ] 03-03-PLAN.md — .love export with .loveignore, Lua LSP via lua-language-server, end-to-end verification

### Phase 4: Pong Rebuild
**Goal**: A complete, independently-written Pong game with working AI paddle, built using the Web IDE
**Depends on**: Phase 2, Phase 3
**Requirements**: PONG-03, PONG-04
**Success Criteria** (what must be TRUE):
  1. Pong runs from `projects/01-pong/` with ball physics, paddle input, collision detection, and score display
  2. AI-controlled paddle mode is implemented and the game is completable against the AI
  3. DEVLOG.md captures the rebuild experience
**Plans**: TBD

### Phase 5: Preview and Deploy
**Goal**: Developer can preview the game in-browser without leaving the IDE and deploy it to an Android device with a single click
**Depends on**: Phase 3
**Requirements**: BRW-01, BRW-02, BRW-03, ADB-01, ADB-02, ADB-03
**Success Criteria** (what must be TRUE):
  1. Game runs in an embedded browser view inside the IDE (love.js), with no separate window required
  2. Developer can switch between native Love2D and browser preview via distinct run options
  3. Developer can package, push, and launch the game on a connected Android phone using a single Deploy button in the IDE
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Environment | 3/3 | Complete | 2026-03-12 |
| 2. Pong Scaffold | 1/1 | Complete | 2026-03-12 |
| 3. Web IDE | 0/3 | Not started | - |
| 4. Pong Rebuild | 0/? | Not started | - |
| 5. Preview and Deploy | 0/? | Not started | - |
