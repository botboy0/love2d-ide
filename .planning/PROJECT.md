# Love2D Game Engine/IDE

## What This Is

A Love2D-based game engine and IDE built on Electron, developed through Harvard's CS50G course. Each completed game project drives a new iteration of the IDE — Pong teaches game loops and state, so the first IDE version gets an Electron shell with live reload. The learning path and the product grow together.

## Core Value

The IDE must make Love2D game development faster and more visual than a text editor alone — starting with live reload and a file tree, evolving toward tile map editors and visual level designers.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

- [ ] Windows environment fully configured (Love2D 11.5 native, Lua 5.1/LuaJIT, ADB)
- [ ] CS50G reference repos cloned and accessible
- [ ] Pong built from scratch (study lecture code, rebuild independently)
- [ ] CS50G "Pong — the AI Update" assignment completed
- [ ] Android deployment working via ADB push of .love files
- [ ] IDE v0.1: Electron shell that launches Love2D projects
- [ ] IDE v0.1: File tree panel for project navigation
- [ ] IDE v0.1: Live reload on file changes

### Out of Scope

- Unity-based CS50G projects (9-11) — Love2D only for this milestone
- Full APK build pipeline — .love push is sufficient for v1
- Mobile-responsive IDE — desktop-only
- Multi-user collaboration features — personal tool first

## Context

- **Windows-only runtime** — Love2D, Electron, and all apps run natively on Windows. WSL2 is used only for CLI tooling (Claude Code, git, etc.)
- GSD workflow controller already operational
- Node.js 20 already installed
- CS50G course uses Love2D 0.10.x; some libraries need compatibility patches for 11.x (notably push.lua)
- ADB uses Windows platform-tools, accessed from WSL via alias to adb.exe
- Long-term vision: personal tool evolving into open-source product for Love2D community
- 8 CS50G Love2D projects total, each feeding an IDE iteration

### Learning Path → IDE Feature Map

| Game | Concepts | IDE Feature |
|------|----------|-------------|
| Pong | Game loop, input, collision, state | Electron shell, file tree, live reload |
| Flappy Bird | Sprites, scrolling, parallax | Asset browser, sprite preview |
| Breakout | State machines, particles | Game state inspector, hot reload |
| Match 3 | Tweening, grid logic | Animation timeline editor |
| Mario | Tilemaps, procedural gen | Tile map editor |
| Zelda | Room transitions, entities | Scene/room editor, entity inspector |
| Angry Birds | Physics (Box2D) | Physics body editor, level designer |
| Pokémon | Turn-based combat, dialogue | Dialogue editor, data table editor |

## Constraints

- **Tech stack**: Love2D 11.5 + Lua 5.1/LuaJIT for games, Electron + Node.js for IDE
- **Platform**: Windows-native for all runtime (Love2D, Electron, ADB); Android for game testing; WSL2 for CLI only
- **Compatibility**: CS50G code targets Love2D 0.10.x — must patch where needed
- **Learning-first**: Each game must be studied and rebuilt from scratch, not just forked

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Love2D 11.5 (not latest) | CS50G compatibility, stable release | — Pending |
| Study + rebuild (not fork) | Deeper learning, own code from day one | — Pending |
| ADB in v1 | Test on real device from the start | — Pending |
| Electron for IDE shell | Cross-platform, Node.js ecosystem, familiar | — Pending |
| Windows-only runtime | Love2D, Electron, ADB all run on Windows natively; WSL is CLI only | — Active |
| Android for testing | Game testing on real device via ADB push of .love files | — Active |

---
*Last updated: 2026-03-12 after initialization*
