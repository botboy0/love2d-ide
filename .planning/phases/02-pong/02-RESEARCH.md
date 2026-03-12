# Phase 2: Pong - Research

**Researched:** 2026-03-12
**Domain:** Love2D / Lua game development — CS50G Pong rebuild with OOP and AI paddle
**Confidence:** HIGH

## Summary

Phase 2 is a hands-on learning phase: the user reads and rebuilds all 13 CS50G Pong incremental versions from scratch, then completes the AI assignment. The goal is deep understanding of the Love2D game loop, OOP with class.lua, AABB collision, and state machine game flow — not a fast build. The rebuild IS the proof of understanding.

All required code and assets already exist in the repository: `course/01-pong/` contains every lecture version (pong-0 through pong-12 plus pong-final), and `projects/_template/` has the patched push.lua ready. The work in this phase is study, incremental coding, and adapting CS50G's flat file structure to the `lib/`/`src/`/`assets/` template layout.

The AI assignment requirement is minimal: move the AI paddle's Y position toward the ball's Y each frame. The complexity is in understanding the rest of the game well enough to integrate it cleanly and make the game completable (not unbeatable).

**Primary recommendation:** Structure the rebuild as three sequential plans — (1) study by reading all 13 versions, (2) implement the complete game with adapted folder structure, (3) add AI and lock in the template. One evolving codebase in `projects/01-pong/`, git-tagged per version milestone.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Read and rebuild ALL 13 CS50G Pong versions sequentially (pong-0 through pong-12 + pong-final)
- User writes the code themselves; Claude acts as reference/helper (explains concepts, answers questions, debugs)
- DEVLOG.md in `projects/01-pong/` captures issues encountered and IDE feature ideas per version
- The rebuild itself is the proof of understanding — no separate study document
- Retro pixel-art style matching CS50G exactly (bitmap font, nearest-neighbor scaling via push.lua)
- Tightly hug the course for Pong and the first few projects
- Use CS50G's sound files; user will tinker with audio on their own and log experience in DEVLOG.md
- Win condition: first to 10 points, matching CS50G
- Implement exactly what the CS50G "AI Update" assignment specifies
- AI behavior, paddle selection, and mode toggling all match the assignment spec
- Study the assignment requirements during the rebuild process, not pre-decided here
- OOP pattern using class.lua (Ball and Paddle classes), matching CS50G's approach
- class.lua and push.lua go in `lib/` (template convention, not CS50G root)
- Ball.lua and Paddle.lua go in `src/` (game-specific code separated from reusable libs)
- Font and sounds go in `assets/` (assets/fonts/, assets/sounds/) — template convention
- Project lives in `projects/01-pong/` using the established template structure

### Claude's Discretion
- Exact DEVLOG.md format and section structure
- How to organize the incremental rebuild (git tags per version, folders, or single evolving codebase)
- Require path adjustments for the lib/ and src/ folder structure

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PONG-01 | CS50G Pong lecture code studied and understood | Version progression map (pong-0 to pong-12) documents what each version teaches; study plan covers all 13 |
| PONG-02 | Pong rebuilt from scratch in `projects/01-pong/` (not forked) | Template structure already in `projects/_template/`; copy it and write fresh code |
| PONG-03 | Game loop, input handling, collision detection, and scoring implemented | All mechanics documented with code patterns from pong-final reference |
| PONG-04 | CS50G "Pong — the AI Update" assignment completed (AI-controlled paddle) | Assignment spec fetched: move paddle Y toward ball Y each frame in the input section |
| PONG-05 | Standard project template established (`main.lua`, `conf.lua`, `lib/`, `assets/`, `src/`) | Template exists; path adjustments for lib/ and src/ documented |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Love2D | 11.5 | Game runtime — window, draw, update, input, audio | Locked by Phase 1; CS50G compatibility |
| Lua | 5.1 (LuaJIT) | Language | Bundled with Love2D 11.5 |
| push.lua | Ulydev master (patched) | Virtual resolution (432x243 in 1280x720 window) | Already patched and in `projects/_template/lib/` |
| class.lua | hump (bundled with CS50G) | OOP — Ball and Paddle classes | Matches CS50G exactly; in `course/01-pong/pong-final/` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| font.ttf | CS50G bitmap font | Retro pixel text at sizes 8, 16, 32 | All text rendering — score, UI messages |
| paddle_hit.wav, score.wav, wall_hit.wav | CS50G | Sound effects | Loaded as `love.audio.newSource(..., 'static')` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| class.lua (hump) | middleclass, 30log | No reason to deviate — CS50G uses hump class.lua; it's already available |
| push.lua virtual resolution | manual scaling | push.lua handles resize events cleanly; don't hand-roll |

**Assets to copy from course reference:**
```bash
# From course/01-pong/pong-final/:
cp class.lua  → projects/01-pong/lib/class.lua
cp font.ttf   → projects/01-pong/assets/fonts/font.ttf
cp sounds/*.wav → projects/01-pong/assets/sounds/

# push.lua already in projects/_template/lib/ (patched)
cp projects/_template/lib/push.lua → projects/01-pong/lib/push.lua
```

---

## The 13-Version Progression

Each CS50G version introduces exactly one concept. The user reads the diff and rebuilds it before moving to the next.

| Version | Name | Key Concept Introduced |
|---------|------|----------------------|
| pong-0 | The Day-0 Update | Bare window — `love.load`, `love.draw`, `love.graphics.printf` |
| pong-1 | The Low-Res Update | push.lua virtual resolution; nearest-neighbor filter |
| pong-2 | The Rectangle Update | Drawing shapes; font loading; `love.graphics.setFont` |
| pong-3 | The Paddle Update | Keyboard input (`love.keyboard.isDown`); constant movement speed |
| pong-4 | The Ball Update | Ball as position+velocity; dt-based movement; `math.randomseed` |
| pong-5 | The Class Update | class.lua OOP; Ball class and Paddle class extracted |
| pong-6 | The FPS Update | `love.timer.getFPS()`; `love.graphics.setColor`; debug overlay |
| pong-7 | The Collision Update | AABB `ball:collides(paddle)`; dx reversal; dy randomization on bounce |
| pong-8 | The Score Update | Score variables; `love.keypressed`; game state machine ('start'/'play') |
| pong-9 | The Serve Update | 'serve' state; servingPlayer; ball reset on score |
| pong-10 | The Victory Update | 'done' state; win condition at 10 points; winningPlayer |
| pong-11 | The Audio Update | `love.audio.newSource`; sounds table; `.play()` on events |
| pong-12 | The Resize Update | `love.resize(w, h)`; `push:resize(w, h)` callback |
| pong-final | Complete game | All of above integrated; Ball.lua, Paddle.lua as separate files |

**Study approach:** Read the source for each version. Understand the delta. Write it from memory into `projects/01-pong/`. Verify it runs. Document pain points in DEVLOG.md.

---

## Architecture Patterns

### Recommended Project Structure

```
projects/01-pong/
├── main.lua          # Game loop: love.load, love.update, love.draw, love.keypressed, love.resize
├── conf.lua          # Window config: 1280x720, vsync=1, t.console=true
├── lib/
│   ├── push.lua      # Virtual resolution (patched for Love2D 11.x)
│   └── class.lua     # OOP system from hump
├── src/
│   ├── Ball.lua      # Ball class: init, update, collides, reset, render
│   └── Paddle.lua    # Paddle class: init, update, render
├── assets/
│   ├── fonts/
│   │   └── font.ttf
│   └── sounds/
│       ├── paddle_hit.wav
│       ├── score.wav
│       └── wall_hit.wav
└── DEVLOG.md         # Issues and IDE feature ideas per version
```

### Pattern 1: Require Path Adjustment

CS50G uses flat file structure (`require 'push'`, `require 'Ball'`). The project template uses subdirectories. Require paths must be updated.

```lua
-- Source: course/01-pong/pong-final/main.lua (original flat style)
push = require 'push'
Class = require 'class'
require 'Paddle'
require 'Ball'

-- Adapted for projects/01-pong/ template structure:
push = require 'lib/push'
Class = require 'lib/class'
require 'src/Paddle'
require 'src/Ball'
```

Asset paths must also be updated:
```lua
-- CS50G original:
love.graphics.newFont('font.ttf', 8)
love.audio.newSource('sounds/paddle_hit.wav', 'static')

-- Template-adapted:
love.graphics.newFont('assets/fonts/font.ttf', 8)
love.audio.newSource('assets/sounds/paddle_hit.wav', 'static')
```

### Pattern 2: Game State Machine

CS50G Pong uses a string-based state machine — a foundational pattern used in all future CS50G projects.

```lua
-- Source: course/01-pong/pong-final/main.lua
-- States: 'start', 'serve', 'play', 'done'
gameState = 'start'

-- In love.update(dt):
if gameState == 'serve' then
    -- set ball velocity based on servingPlayer
elseif gameState == 'play' then
    -- run collision + boundary detection
end

-- In love.keypressed(key):
if key == 'enter' or key == 'return' then
    if gameState == 'start' then
        gameState = 'serve'
    elseif gameState == 'serve' then
        gameState = 'play'
    elseif gameState == 'done' then
        gameState = 'serve'
        ball:reset()
        player1Score = 0
        player2Score = 0
    end
end
```

### Pattern 3: AABB Collision Detection

```lua
-- Source: course/01-pong/pong-final/Ball.lua
function Ball:collides(paddle)
    if self.x > paddle.x + paddle.width or paddle.x > self.x + self.width then
        return false
    end
    if self.y > paddle.y + paddle.height or paddle.y > self.y + self.height then
        return false
    end
    return true
end

-- On collision (in main.lua love.update):
if ball:collides(player1) then
    ball.dx = -ball.dx * 1.03        -- reverse and accelerate
    ball.x = player1.x + 5           -- prevent tunneling
    ball.dy = (ball.dy < 0) and -math.random(10, 150) or math.random(10, 150)
    sounds['paddle_hit']:play()
end
```

### Pattern 4: push.lua Virtual Resolution

```lua
-- Source: course/01-pong/pong-final/main.lua
VIRTUAL_WIDTH = 432
VIRTUAL_HEIGHT = 243

push:setupScreen(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, WINDOW_WIDTH, WINDOW_HEIGHT, {
    fullscreen = false,
    resizable = true,
    vsync = true,
    canvas = false   -- NOTE: canvas=false avoids getDPIScale issue
})

-- In love.draw():
push:start()
-- ... all draw calls here ...
push:finish()

-- In love.resize(w, h):
push:resize(w, h)
```

### Pattern 5: AI Paddle (Assignment Spec)

The CS50G assignment requires: replace keyboard input for one paddle with code that moves toward the ball's Y position.

```lua
-- Assignment spec (fetched from cs50.harvard.edu/extension/games/2024/fall/projects/0/pong/):
-- "implement an AI-controlled paddle such that it will try to deflect the ball at all times"
-- "the paddle can move on only one axis (the Y axis)"
-- "each paddle has its own chunk of code where input is detected by the keyboard;
--   this feels like an excellent place to put the code we need!"

-- Implementation in love.update(dt), replacing player2 keyboard section:
if gameState == 'play' then
    -- Simple tracking AI: move toward ball Y
    if ball.y < player2.y then
        player2.dy = -PADDLE_SPEED
    elseif ball.y > player2.y + player2.height then
        player2.dy = PADDLE_SPEED
    else
        player2.dy = 0
    end
end
```

**Note on difficulty:** A perfectly tracking AI is unbeatable. The assignment says "try to deflect the ball" — a simple tracker at full speed is valid. The user may optionally cap AI speed to make it beatable; document rationale in DEVLOG.md.

### Anti-Patterns to Avoid

- **Forking pong-final:** Do not copy the reference and modify it. Write from scratch per the locked decision.
- **Skipping version steps:** Don't jump from pong-0 to pong-final. Each version teaches one concept. Skip a version, miss that concept.
- **Using canvas=true in push:setupScreen:** The patched push.lua fixes getDPIScale — but keep `canvas = false` to avoid a separate rendering layer bug on some Windows drivers. Verify if issues arise.
- **Forgetting color reset after setColor:** `love.graphics.setColor` is persistent. Always reset to `(1, 1, 1, 1)` (or `255, 255, 255, 255` in RGBA255 style) after drawing colored elements.
- **Ball tunneling:** On fast frames, the ball can skip through a paddle. CS50G prevents this by snapping `ball.x` to paddle edge after collision — do not omit this.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Virtual resolution scaling | Custom scale/translate logic | push.lua (already in `lib/`) | Handles resize events, letterboxing, coordinate mapping |
| OOP in Lua | Custom metatables from scratch | class.lua (hump) | Handles `__index` inheritance, `init` convention — already in course repo |
| Font rendering | `love.graphics.print` positioning math | `love.graphics.printf` with alignment | Built-in centering; push.lua coordinates are virtual |

**Key insight:** push.lua and class.lua exist precisely so developers don't think about virtual-to-window coordinate mapping or Lua metatables during game logic.

---

## Common Pitfalls

### Pitfall 1: `require` Paths Break in Template Structure
**What goes wrong:** CS50G code uses `require 'push'` which works because files are in the same directory as main.lua. The template puts libs in `lib/` — Love2D resolves require paths relative to main.lua but uses `/` not `.` for subdirectories.
**Why it happens:** Lua's require uses `.` as path separator (for packages), but Love2D overrides require to support `/` for file system paths.
**How to avoid:** Use `require 'lib/push'` and `require 'src/Ball'` — not `require 'lib.push'`.
**Warning signs:** "module 'push' not found" error on launch.

### Pitfall 2: Color API Difference (RGBA255 vs RGBA01)
**What goes wrong:** CS50G code uses `love.graphics.setColor(40/255, 45/255, 52/255, 255/255)` — the /255 conversion. This is the Love2D 11.x API (0.0–1.0 range). The same code in older Love2D used 0–255 integers directly.
**Why it happens:** Love2D 11.0 changed color range from 0–255 to 0–1.
**How to avoid:** Always use 0–1 values or the /255 conversion. The template is already on 11.5 so this is the correct API.
**Warning signs:** Colors look wrong (oversaturated or white) — usually means someone passed integer 0–255 values.

### Pitfall 3: DT-Independent Movement Not Applied
**What goes wrong:** Movement like `ball.x = ball.x + ball.dx` without `* dt` runs at different speeds on different machines/framerates.
**Why it happens:** Beginners often forget dt when first implementing movement.
**How to avoid:** Every position update must be `position + velocity * dt`. This is introduced in pong-4 and must be carried through all subsequent versions.
**Warning signs:** Game runs differently on different machines or when FPS fluctuates.

### Pitfall 4: Ball Stays in paddle on Collision (Tunneling Fix Omitted)
**What goes wrong:** Ball enters a paddle, collision fires, dx reverses, but ball is still inside the paddle — fires collision again next frame, reversing back. Ball gets stuck.
**Why it happens:** AABB collision only detects overlap; it doesn't resolve penetration.
**How to avoid:** After reversing dx on player1 collision, set `ball.x = player1.x + player1.width`. After player2, set `ball.x = player2.x - ball.width`.
**Warning signs:** Ball vibrates rapidly when touching a paddle.

### Pitfall 5: gameState String Typos
**What goes wrong:** Typo in state name ('paly' instead of 'play') causes silent logic failure — state transitions stop working.
**Why it happens:** String-based state machines in Lua have no compile-time checking.
**How to avoid:** Define states as constants at the top of main.lua, or be careful and consistent. Cross-check all state assignments and comparisons.
**Warning signs:** Game stops responding to Enter key, paddles don't move, or ball stops.

---

## Code Examples

### Ball Reset and Velocity Initialization
```lua
-- Source: course/01-pong/pong-final/main.lua — love.update 'serve' state
function Ball:reset()
    self.x = VIRTUAL_WIDTH / 2 - 2
    self.y = VIRTUAL_HEIGHT / 2 - 2
    self.dx = 0
    self.dy = 0
end

-- On transitioning to 'play' from 'serve':
ball.dy = math.random(-50, 50)
if servingPlayer == 1 then
    ball.dx = math.random(140, 200)
else
    ball.dx = -math.random(140, 200)
end
```

### Paddle Boundary Clamping
```lua
-- Source: course/01-pong/pong-final/Paddle.lua
function Paddle:update(dt)
    if self.dy < 0 then
        self.y = math.max(0, self.y + self.dy * dt)
    else
        self.y = math.min(VIRTUAL_HEIGHT - self.height, self.y + self.dy * dt)
    end
end
```

### Sound Loading and Playback
```lua
-- Source: course/01-pong/pong-final/main.lua — love.load
-- Adapted for assets/sounds/ path:
sounds = {
    ['paddle_hit'] = love.audio.newSource('assets/sounds/paddle_hit.wav', 'static'),
    ['score']      = love.audio.newSource('assets/sounds/score.wav', 'static'),
    ['wall_hit']   = love.audio.newSource('assets/sounds/wall_hit.wav', 'static')
}

-- Usage:
sounds['paddle_hit']:play()
```

### Score Display
```lua
-- Source: course/01-pong/pong-final/main.lua — displayScore()
-- NOTE: love.graphics.print (not printf) for score — no centering needed, positioned explicitly
love.graphics.setFont(scoreFont)
love.graphics.print(tostring(player1Score), VIRTUAL_WIDTH / 2 - 50, VIRTUAL_HEIGHT / 3)
love.graphics.print(tostring(player2Score), VIRTUAL_WIDTH / 2 + 30, VIRTUAL_HEIGHT / 3)
```

### DEVLOG.md Format (Claude's Discretion)
Recommended structure per version entry:
```markdown
## pong-N — [Version Name]
**Date:** YYYY-MM-DD
**Concepts studied:** [list]
**Issues encountered:** [what went wrong, how fixed]
**IDE feature ideas:** [things that would have helped]
```

---

## Incremental Rebuild Organization (Claude's Discretion)

**Recommendation: Single evolving codebase with git tags per milestone.**

Options evaluated:
1. Separate folders per version (13 copies) — clutters `projects/01-pong/`, wastes disk, awkward to run the "current" version
2. Single evolving codebase with git tags — clean working directory, full history preserved, easy to run `love .` at any point
3. No tracking at all — loses the learning record

**Use option 2.** After completing each version milestone in `projects/01-pong/`, commit with message like `feat(pong): pong-N complete - [Version Name]` and tag `pong-N`. The DEVLOG.md grows as versions complete.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `love.graphics.setColor(255, 255, 255, 255)` | `love.graphics.setColor(1, 1, 1, 1)` | Love2D 11.0 | CS50G code uses /255 conversion — correct for 11.x |
| `push:setupScreen(..., {vsync=true})` | `conf.lua t.window.vsync = 1` | Love2D 11.x | vsync integer vs boolean; conf.lua handles it — push.lua arg may be ignored |
| `love.graphics.newFont()` (system font fallback) | Always provide explicit font file | Love2D 11.x | System fonts may render differently; CS50G always uses font.ttf |

**Deprecated/outdated:**
- `love.graphics.getPixelScale()` (used in older push.lua): replaced by `love.window.getDPIScale()` in Love2D 11.x. The patched push.lua in `projects/_template/lib/` already has this fix.
- `love.audio.newSource(path)` without second arg: In Love2D 11.x, the type argument (`'static'` or `'stream'`) is required.

---

## Open Questions

1. **AI paddle difficulty tuning**
   - What we know: The assignment only requires the AI to "try to deflect the ball" — a basic Y-tracker satisfies the spec
   - What's unclear: Whether the user wants the AI to be beatable (capped speed) or a demonstration of perfect tracking
   - Recommendation: Implement exact-tracking first (satisfies PONG-04), then let the user tune in DEVLOG.md if desired

2. **Mode toggle for AI vs 2-player**
   - What we know: Assignment says "either the left or right will do (or both, if desired)" — no explicit toggle requirement in the spec fetched
   - What's unclear: CONTEXT.md says "AI behavior, paddle selection, and mode toggling all match the assignment spec" — but the spec doesn't mandate a toggle
   - Recommendation: Implement AI on player2 only. If the spec has a toggle requirement, it will surface when the user reads the assignment during the rebuild. Plan 02-03 covers this.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — Love2D games have no automated test runner in this project |
| Config file | N/A |
| Quick run command | `love projects/01-pong/` (Windows: via WSL alias or directly) |
| Full suite command | `love projects/01-pong/` + manual play-through verification |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PONG-01 | CS50G code studied | manual | N/A — DEVLOG.md review | ❌ Wave 0: create DEVLOG.md |
| PONG-02 | Game runs from `projects/01-pong/` | smoke | `love /mnt/c/Users/Trynda/Desktop/Dev/Lua/projects/01-pong/` | ❌ Wave 0: create project |
| PONG-03 | Ball physics, paddle input, collision, score display working | manual | Launch game and play | ❌ Wave 0: create project |
| PONG-04 | AI paddle deflects ball; game completable | manual | Launch and let AI play | ❌ Wave 0: create project |
| PONG-05 | Template structure present with correct file layout | smoke | `ls projects/01-pong/` directory check | ❌ Wave 0: create project |

**Note:** Love2D game logic is not unit-testable without a framework like busted. This phase has no automated unit tests — all verification is manual smoke testing by running the game. This is appropriate for a 2D game learning exercise.

### Sampling Rate
- **Per task commit:** `love /mnt/c/Users/Trynda/Desktop/Dev/Lua/projects/01-pong/` — verify game launches and runs
- **Per wave merge:** Manual play-through checklist (ball bounces, paddles move, score increments, AI moves, win screen appears)
- **Phase gate:** All PONG-01 through PONG-05 manually verified before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `projects/01-pong/` — create by copying `projects/_template/` structure
- [ ] `projects/01-pong/DEVLOG.md` — create empty with version section headers
- [ ] Copy assets: `course/01-pong/pong-final/{class.lua,font.ttf,sounds/}` to correct template paths

*(No automated test framework install required — manual verification is the appropriate method for this phase)*

---

## Sources

### Primary (HIGH confidence)
- `course/01-pong/pong-final/main.lua` — complete reference implementation read directly
- `course/01-pong/pong-final/Ball.lua` — AABB collision and update pattern
- `course/01-pong/pong-final/Paddle.lua` — boundary clamping pattern
- `projects/_template/` — established template structure confirmed by directory listing
- cs50.harvard.edu/extension/games/2024/fall/projects/0/pong/ — AI assignment spec fetched

### Secondary (MEDIUM confidence)
- Version names verified by reading each `pong-N/main.lua` header comment directly
- push.lua path confirmed in `projects/_template/lib/push.lua` (patched version)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified by reading actual files in repo
- Architecture: HIGH — template structure verified, require path adjustments confirmed
- CS50G version progression: HIGH — all 13 version names read from source files
- AI assignment spec: HIGH — fetched from live cs50.harvard.edu course page
- Pitfalls: HIGH — sourced from reading actual code and known Love2D 11.x migration notes

**Research date:** 2026-03-12
**Valid until:** 2026-06-12 (stable — Love2D 11.5 and CS50G course content are stable)
