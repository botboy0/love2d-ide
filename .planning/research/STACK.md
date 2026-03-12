# Stack Research: Love2D Game Engine/IDE

## Love2D Game Layer

| Component | Recommendation | Rationale | Confidence |
|-----------|---------------|-----------|------------|
| **Love2D** | 11.5 (stable PPA) | CS50G compatible with minor patches; latest stable | High |
| **Lua runtime** | Lua 5.1 + LuaJIT | Love2D is built on LuaJIT (Lua 5.1 compatible) | High |
| **Resolution handling** | push.lua (Ulydev/push) | Virtual resolution library; CS50G uses it. Must use latest master for 11.x compat (`getPixelScale` → `getDPIScale`) | High |
| **Class system** | hump.Class or classic | CS50G uses a simple class.lua; hump is more full-featured. Either works | Medium |
| **Timer/tweening** | knife.timer or hump.timer | Delayed calls, tweening, chained animations. CS50G uses a basic timer | Medium |
| **Collision** | bump.lua 3.1 | AABB collision detection and resolution. Better than manual collision for platformers/top-down | High |
| **Animation** | anim8 | Sprite sheet animation. Simple API, widely used | High |
| **Tilemap loading** | STI (Simple Tiled Implementation) | Loads Tiled (.tmx) maps. Essential for Mario/Zelda projects | High |
| **Utilities** | lume | Lua utility functions (math, table, string helpers) | Medium |
| **Physics** | love.physics (Box2D) | Built into Love2D. Only needed for Angry Birds project | High |

### Library Management

Vendor libraries into a `lib/` directory per project. Do NOT use LuaRocks for game runtime dependencies — Love2D games should be self-contained zips.

LuaRocks is fine for dev tools (luacheck, etc.) but not for game code.

## Electron IDE Layer

| Component | Recommendation | Rationale | Confidence |
|-----------|---------------|-----------|------------|
| **Shell** | Electron (latest stable) | Cross-platform desktop app. Node.js backend for file ops, Chromium for UI | High |
| **Bundler** | electron-builder | Package and distribute. Handles Windows/Linux/Mac | High |
| **File watching** | chokidar 3.x | Reliable cross-platform file watcher for live reload | High |
| **Editor component** | CodeMirror 6 | Lightweight, extensible code editor. Lua mode available. Better than Monaco for embedded use (smaller bundle) | High |
| **UI framework** | Vanilla HTML/CSS/JS for v0.1 | No React/Vue overhead for initial version. Add framework later if complexity warrants | High |
| **IPC pattern** | contextBridge + preload.js | Secure Electron IPC. Never enable `nodeIntegration: true` | High |
| **Process management** | child_process.spawn | Launch Love2D as child process from Electron | High |

## Lua Development Tools

| Tool | Purpose | Install Method |
|------|---------|----------------|
| **lua-language-server (LuaLS)** | LSP for Lua — autocomplete, diagnostics, type checking | GitHub releases or VS Code extension |
| **luacheck** | Static analysis / linting | `luarocks install luacheck` |
| **stylua** | Lua code formatter (Rust-based, fast) | GitHub releases or cargo |

## Android Deployment

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Runtime** | love-android APK (normal, not embed) | Install on phone, push .love files to it |
| **ADB method** | Windows ADB aliased into WSL | Simpler than usbipd-win. `alias adb='/mnt/c/platform-tools/adb.exe'` |
| **Packaging** | zip → .love file | `zip -9 -r game.love . -x "*.git*"` |
| **Launch** | `adb shell am start` | Push .love, launch with intent |

## What NOT to Use

| Don't Use | Why |
|-----------|-----|
| **Tauri** | Rust toolchain complexity for no benefit over Electron at this stage |
| **Monaco Editor** | 15MB+ bundle, designed for VS Code. CodeMirror 6 is lighter and sufficient |
| **React/Vue for v0.1** | Premature abstraction. Vanilla JS is faster to iterate for initial shell |
| **Full Gradle APK build** | Weeks of Android SDK/NDK setup. .love push is instant for dev |
| **LuaRocks for game deps** | Games must be self-contained. Vendor libs instead |
| **love.physics for tile collision** | Overkill. Use bump.lua for AABB collision (Pong through Zelda) |

## CS50G Compatibility Notes

- CS50G code targets Love2D 0.10.x
- Main breaking change: `push.lua` uses deprecated `getPixelScale()` → replace with `getDPIScale()`
- Some projects use `love.graphics.setDefaultFilter` differently
- Fix: update push.lua from Ulydev/push master branch
- All other CS50G code generally works on 11.5 without changes
