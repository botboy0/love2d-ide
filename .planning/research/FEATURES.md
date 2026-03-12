# Features Research: Love2D Game Engine/IDE

## Existing Tools in This Space

- **ZeroBrane Studio** — Lua IDE with Love2D integration, debugging, live coding
- **VS Code + Love2D extensions** — Lua LSP, snippets, launch configs
- **Godot/Unity** — Full engines with visual editors (inspiration for feature scope)
- **TIC-80/PICO-8** — Fantasy consoles with built-in editors (inspiration for integrated experience)

## Table Stakes

Features users expect from any Love2D development tool. Missing these = users leave.

| Feature | Complexity | Dependencies | Notes |
|---------|-----------|--------------|-------|
| **Project file tree** | Low | Electron shell | Navigate and open files |
| **Code editor with Lua syntax highlighting** | Medium | CodeMirror 6 + Lua mode | Basic editing capability |
| **Run game from IDE** | Low | child_process.spawn | One-click launch of Love2D |
| **Live reload on save** | Medium | chokidar + Love2D restart | Core developer experience improvement |
| **Console output capture** | Low | stdout/stderr pipe | See print() and error output |
| **Error display with file/line** | Medium | Parse Love2D error output | Click-to-navigate to error location |
| **Project creation from template** | Low | File copy | New project scaffolding |

## Differentiators

Features that set this IDE apart from VS Code + extensions.

| Feature | Complexity | Dependencies | Notes |
|---------|-----------|--------------|-------|
| **Game state inspector** | High | Love2D IPC or debug protocol | View/modify game variables at runtime |
| **Hot reload without restart** | High | Lua module reloading | Change code, see results without restarting game |
| **Visual tile map editor** | Very High | Canvas-based editor | Biggest quality-of-life feature. Replaces external Tiled editor |
| **Sprite/asset preview panel** | Medium | Image rendering in Electron | Browse and preview game assets |
| **Animation timeline editor** | High | Custom UI component | Visual tween/animation editing |
| **Physics body editor** | Very High | Box2D visualization | Visual physics shape editing |
| **Scene/room editor** | Very High | Canvas + entity system | Drag-and-drop level design |
| **Dialogue editor** | High | Tree/graph UI | Visual dialogue tree creation |
| **Integrated Android deployment** | Medium | ADB wrapper | One-click deploy to phone |
| **Performance profiler** | High | Love2D profiling hooks | FPS, memory, draw call visualization |

## Anti-Features (Do NOT Build)

| Feature | Why Not |
|---------|---------|
| **Full game engine runtime** | Love2D IS the runtime. Don't rewrite it. Wrap it. |
| **Visual scripting / node editor** | Lua is simple enough. Visual scripting adds massive complexity for minimal benefit in Love2D context |
| **Built-in physics engine** | Love2D ships Box2D. Don't compete. |
| **Multiplayer/networking tools** | Out of scope. CS50G doesn't cover networking. |
| **3D support** | Love2D is 2D. Don't fight it. |
| **Asset store / marketplace** | Community feature, not an IDE feature for v1 |
| **Cloud save / sync** | Git handles this. Don't reinvent. |
| **AI coding assistant** | Scope creep. Use external tools. |

## Feature Dependencies (Build Order)

```
Electron shell → File tree → Code editor → Run game → Console output
                                              ↓
                                         Live reload → Hot reload (advanced)
                                              ↓
                                    Error display → Click-to-navigate
                                              ↓
                                    Asset preview → Sprite browser
                                              ↓
                                    State inspector → Performance profiler
                                              ↓
                               Tile map editor → Scene editor → Level designer
```

## Learning Path Alignment

Each CS50G project naturally teaches concepts needed for the next IDE feature:

1. **Pong** → You learn game loops/state → Build: Electron shell, file tree, live reload
2. **Flappy Bird** → You learn sprites/scrolling → Build: Asset browser, sprite preview
3. **Breakout** → You learn state machines → Build: State inspector, hot reload
4. **Match 3** → You learn tweening → Build: Animation timeline
5. **Mario** → You learn tilemaps → Build: Tile map editor
6. **Zelda** → You learn entities/rooms → Build: Scene editor
7. **Angry Birds** → You learn physics → Build: Physics body editor
8. **Pokemon** → You learn dialogue/data → Build: Dialogue editor
