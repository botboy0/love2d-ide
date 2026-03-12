# Phase 1: Environment - Research

**Researched:** 2026-03-12
**Domain:** Love2D Windows setup, WSL2 tooling, ADB, workspace scaffolding
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Love2D runs as Windows native (love.exe), NOT inside WSL2
- WSL2 is used for Claude Code, git, and CLI commands only — no WSLg dependency
- Create a WSL shell alias/wrapper to call Windows love.exe from WSL
- Check if Love2D 11.5 is already installed on Windows; download and install if not
- Minimal test project: colored window + short beep sound
- Must confirm both display and audio work via Windows love.exe
- Test project kept permanently as `projects/00-test/` for future sanity checks after system updates
- Phase 1 BLOCKS if verification fails — no proceeding with broken display or audio
- LuaRocks: just verify `luarocks --version` works, no test package install needed
- Numbered folders under `course/`: 01-pong/, 02-flappy-bird/, 03-breakout/, etc.
- Each folder contains both lecture code AND assignment distribution code
- Matches CS50G lecture order for sequential navigation
- Workspace lives on Windows filesystem (this repo: /mnt/c/Users/Trynda/Desktop/Dev/Lua/)
- NOT in WSL home directory — everything Windows-side
- Directory structure: `course/`, `projects/`, `ide/`
- Create `projects/_template/` with skeleton files for new games
- Template: main.lua with love.load/update/draw skeleton, conf.lua with CS50G defaults (1280x720 virtual resolution, vsync on), folders: lib/, assets/, src/, push.lua (patched for Love2D 11.x) pre-installed in lib/
- Install Android platform-tools on Windows (not currently installed)
- Create WSL alias to Windows adb.exe
- Full end-to-end test: push the verification test game (.love file) to Android device
- Love for Android player app is already installed on the phone
- This proves the complete chain: build on Windows → push via ADB → run on phone

### Claude's Discretion
- Exact Love2D Windows installation method (installer vs zip extract)
- Shell alias implementation details (bash alias vs wrapper script)
- How to package the test project as .love for Android push
- LuaRocks installation approach in WSL

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ENV-01 | Love2D 11.5 installed on Windows and verified working (`love --version` + render test with window and sound) | Love2D 11.5 release on GitHub; installer adds to PATH; WSL alias pattern confirmed |
| ENV-02 | Lua 5.1, LuaJIT, and LuaRocks installed (WSL for CLI use) | apt packages available; luarocks apt package; version verification commands documented |
| ENV-03 | Love2D opens a window with audio on Windows natively (no WSLg dependency) | Minimal test project pattern; love.audio.newSource for programmatic beep; OpenAL on Windows |
| ENV-04 | CS50G repos (all 8 Love2D projects) cloned to workspace `course/` directory | games50 GitHub org confirmed; 8 repos identified with exact names |
| ENV-05 | push.lua compatibility fix applied for Love2D 11.x | Ulydev/push master has getDPIScale fix; exact conditional logic documented |
| ENV-06 | Workspace directory structure created (`course/`, `projects/`, `ide/`) on Windows filesystem | mkdir pattern; template structure; conf.lua defaults documented |
| ENV-07 | Windows ADB platform-tools installed, accessible from WSL via alias to adb.exe | Android platform-tools download URL; WSL alias pattern; ADB push command for Android deployment |
</phase_requirements>

---

## Summary

Phase 1 is a pure setup phase — no code to write, only installation, configuration, and verification tasks. The primary risk is silent environment failures that waste time in later phases. Every task has a hard verification gate: if it cannot be demonstrated to work, the phase does not advance.

The execution model is locked: Love2D runs as a Windows native process (`love.exe`), and WSL2 is exclusively for Claude Code and CLI tooling. There is no WSLg involvement. This means audio and display depend entirely on Windows drivers and OpenAL — no Linux audio stack (PulseAudio, PipeWire) is involved. The verification test project (colored window + programmatic audio beep) must be confirmed working on Windows before proceeding.

The ADB push path has a version-dependent caveat: the classic `adb shell am start` intent launch only works reliably on Android 6 and earlier. For Android 10+ (scoped storage), the lovegame folder approach at `/sdcard/Android/data/org.love2d.android/files/games/lovegame/` is the documented path. The exact Android version on the user's phone determines which method to use. The planner should document both methods and test which applies.

**Primary recommendation:** Install Love2D 11.5 via the Windows installer (adds to PATH automatically), then verify in sequence — version, window, audio — before touching anything else. Failures here must be fixed before any other work begins.

---

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Love2D | 11.5 | Game runtime (Windows native) | CS50G compatibility target; stable release Dec 2023 |
| Lua (WSL) | 5.1 | CLI scripting / LuaRocks target | Matches Love2D embedded LuaJIT ABI |
| LuaJIT (WSL) | 2.1 | JIT-compiled Lua runtime | Available alongside Lua 5.1 via apt |
| LuaRocks (WSL) | 3.x | Lua package manager | CLI tooling only; not used for game runtime deps |
| Android platform-tools | Latest | ADB for device deployment | Official Google release; only stable ADB source |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| push.lua (Ulydev, master) | 0.4+ | Virtual resolution scaling | Pre-installed in every project template |
| Windows PATH / System env vars | N/A | love.exe callable from cmd/PowerShell | Set during Love2D installer or manually |
| WSL ~/.zshrc aliases | N/A | love.exe and adb.exe callable from WSL | Added once, used by all future phases |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Windows installer (love.exe) | Zip extract anywhere | Installer auto-adds to PATH; zip requires manual PATH edit — installer preferred |
| WSL alias in ~/.zshrc | Wrapper shell script in /usr/local/bin | Alias is simpler for single binary; wrapper script is better if args need transformation — alias sufficient here |
| apt install lua5.1 luajit luarocks | Build from source | apt is faster, well-maintained on Ubuntu/Debian; build from source only needed for custom versions |
| Android lovegame folder (adb push) | usbipd-win USB passthrough | WSL alias to adb.exe is the decided approach — simpler, no kernel module required |

### Installation

**Love2D (Windows) — Run in PowerShell or download manually:**
```
https://github.com/love2d/love/releases/download/11.5/love-11.5-win64.exe
```
Run the installer; it installs to `C:\Program Files\LOVE\` and adds to system PATH.

**Lua + LuaJIT + LuaRocks (WSL):**
```bash
sudo apt update && sudo apt install -y lua5.1 luajit luarocks
```

**Android platform-tools (Windows):**
```
https://developer.android.com/tools/releases/platform-tools
```
Download the Windows zip, extract to a known location (e.g. `C:\platform-tools\`), add to Windows PATH.

**WSL aliases (add to ~/.zshrc):**
```bash
alias love='/mnt/c/Program\ Files/LOVE/love.exe'
alias adb='/mnt/c/platform-tools/adb.exe'
```

---

## Architecture Patterns

### Recommended Project Structure
```
/mnt/c/Users/Trynda/Desktop/Dev/Lua/   (this repo, Windows filesystem)
├── course/
│   ├── 01-pong/          # games50/pong (lecture + distro folders inside)
│   ├── 02-flappy-bird/   # games50/fifty-bird
│   ├── 03-breakout/      # games50/breakout
│   ├── 04-match3/        # games50/match3
│   ├── 05-mario/         # games50/mario
│   ├── 06-zelda/         # games50/zelda
│   ├── 07-angry-birds/   # games50/angrybirds
│   └── 08-pokemon/       # games50/pokemon
├── projects/
│   ├── 00-test/          # verification test project (permanent)
│   └── _template/        # copy this to start new games
│       ├── main.lua
│       ├── conf.lua
│       ├── lib/
│       │   └── push.lua  # patched Ulydev/push master
│       ├── assets/
│       └── src/
└── ide/                  # Phase 3 Electron app (empty now)
```

### Pattern 1: WSL Alias to Windows Executable

**What:** Add shell aliases to `~/.zshrc` (or `~/.bashrc`) pointing at `.exe` files on the Windows filesystem via `/mnt/c/`.

**When to use:** Any time a Windows-native tool needs to be callable from WSL CLI. Applies to `love.exe` (Phase 1), `adb.exe` (Phase 1), and potentially others later.

**Example:**
```bash
# In ~/.zshrc
alias love='/mnt/c/Program\ Files/LOVE/love.exe'
alias adb='/mnt/c/platform-tools/adb.exe'

# Verify:
love --version          # Should print: LOVE 11.5.x (Mysterious Mysteries)
adb version             # Should print: Android Debug Bridge version X.X.X
```

**Note:** WSL2 can call Windows `.exe` files natively without aliases — `love.exe` works directly — but the alias removes the `.exe` suffix for a cleaner CLI experience and is more portable if the path changes.

### Pattern 2: Minimal Love2D Test Project

**What:** A bare-minimum Love2D project that verifies both display and audio.

**When to use:** Phase 1 verification; kept as `projects/00-test/` for future regression checks.

**Example:**
```lua
-- main.lua (verification test project)
-- Source: Love2D wiki - Tutorial:Audio + love.graphics

local beep

function love.load()
    -- Audio: generate a 440Hz sine wave beep (0.3 seconds)
    local sampleRate = 44100
    local duration = 0.3
    local data = love.sound.newSoundData(math.floor(sampleRate * duration), sampleRate, 16, 1)
    for i = 0, data:getSampleCount() - 1 do
        local t = i / sampleRate
        data:setSample(i, 0.5 * math.sin(2 * math.pi * 440 * t))
    end
    beep = love.audio.newSource(data)
    beep:play()
end

function love.draw()
    love.graphics.setBackgroundColor(0.2, 0.6, 1)
    love.graphics.setColor(1, 1, 1)
    love.graphics.printf("Love2D " .. love.getVersion() .. " OK", 0, 200, love.graphics.getWidth(), "center")
    love.graphics.printf("If you hear a beep, audio works.", 0, 240, love.graphics.getWidth(), "center")
end
```

### Pattern 3: Standard Project Template (conf.lua)

**What:** CS50G-compatible conf.lua using 1280x720 window, vsync enabled.

**When to use:** All game projects starting from Phase 2 Pong. Template is copied, not modified in-place.

**Example:**
```lua
-- conf.lua
-- Source: Love2D wiki - Config Files
function love.conf(t)
    t.window.title   = "Game"
    t.window.width   = 1280
    t.window.height  = 720
    t.window.vsync   = 1       -- 1 = enabled (Love2D 11.x uses integer, not boolean)
    t.window.resizable = false
end
```

### Pattern 4: push.lua Compatibility Fix

**What:** Ulydev/push master branch contains a Love2D version check that selects `getDPIScale` (11.x) or `getPixelScale` (0.10.x).

**When to use:** Every CS50G project that uses push.lua. Use the master branch version directly — do not use the version bundled with CS50G repo checkouts, which targets 0.10.x.

**The fix (from Ulydev/push master):**
```lua
-- In push.lua (from master branch, not old CS50G copies)
local love11 = love.getVersion() == 11
local getDPI = love11 and love.window.getDPIScale or love.window.getPixelScale
```

**Action:** Download `push.lua` from `https://raw.githubusercontent.com/Ulydev/push/master/push.lua` and place it in `projects/_template/lib/push.lua`. All projects copy from the template, so all projects get the fixed version automatically.

### Pattern 5: ADB .love File Deployment

**What:** Package game as .love file (zip rename), push to Android device, launch via LOVE for Android player.

**When to use:** Phase 1 end-to-end ADB verification test.

**How to package .love:**
```bash
# From the project directory (e.g. projects/00-test/)
# .love is a zip of all game files with main.lua at root
zip -r test-game.love . -x "*.git*"
# Or on Windows PowerShell:
# Compress-Archive -Path * -DestinationPath test-game.love
```

**ADB deployment (via WSL alias to adb.exe):**
```bash
# For Android 10+ (scoped storage — lovegame folder method):
adb push test-game.love /sdcard/Android/data/org.love2d.android/files/games/lovegame/test-game.love
# Then manually open LOVE for Android app on phone to pick it up

# For Android 6 and earlier (direct intent launch):
adb push test-game.love /sdcard/test-game.love
adb shell am start -S -n "org.love2d.android/.GameActivity" -d "file:///sdcard/test-game.love"
```

**IMPORTANT:** The `adb shell am start` intent method is documented as working only on Android 6 and earlier. Android 10+ uses scoped storage — the lovegame folder approach is required, with manual launch of the LOVE for Android app. The planner must include a step to determine which Android version the user's phone runs before committing to a deployment command.

### Anti-Patterns to Avoid

- **WSLg for display/audio:** Never configure Love2D to use WSLg. It is explicitly out of scope and adds fragile X11/Wayland dependencies. Windows native handles display and OpenAL.
- **Installing Love2D inside WSL:** LuaRocks and Lua 5.1 in WSL are for CLI tools only. Do not install the `love` package for Linux in WSL — it will not be used and may cause confusion.
- **Using old push.lua from CS50G repos:** The CS50G lecture repos contain push.lua versions targeting Love2D 0.10.x. Always use the master branch from Ulydev/push.
- **Running `adb` from both Windows and WSL simultaneously:** Windows adb.exe and a hypothetical WSL adb would conflict on port 5037. The alias approach avoids this by using only the Windows binary.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Virtual resolution scaling | Custom scale/transform logic | push.lua (Ulydev/push master) | push.lua handles letterboxing, DPI, canvas scaling; edge cases in custom solutions take hours to find |
| .love packaging | Custom file bundler | `zip` CLI rename to `.love` | The .love format IS a zip — no tooling needed |
| Audio test tone | Finding and bundling a .wav file | love.sound.newSoundData + setSample | Love2D can generate PCM audio in-memory; no external file needed for verification |
| ADB wrapper | usbipd-win USB passthrough | WSL alias to adb.exe | Alias is 1 line; usbipd-win requires kernel module, Windows service, device attachment workflow |

**Key insight:** Phase 1 is plumbing. Resist any temptation to add abstractions. If it verifies the toolchain works, it's done.

---

## Common Pitfalls

### Pitfall 1: Love2D Not on Windows PATH After Installation
**What goes wrong:** `love --version` fails in cmd/PowerShell after installation. The installer may or may not have added to PATH depending on user vs. system scope.
**Why it happens:** Windows installer adds to PATH but may require terminal restart, or PATH changes are session-scoped.
**How to avoid:** After installation, open a fresh PowerShell window (not the one open during install) and run `love --version`. If it fails, manually add `C:\Program Files\LOVE\` to System PATH via Environment Variables.
**Warning signs:** `'love' is not recognized as an internal or external command`

### Pitfall 2: WSL Alias Points to Wrong Path
**What goes wrong:** The alias is added to `~/.zshrc` but love.exe is not at the expected path (e.g., installed as 32-bit to `Program Files (x86)` instead of `Program Files`).
**Why it happens:** 32-bit vs. 64-bit installer selection; custom install directory chosen during setup.
**How to avoid:** After Windows installation, run `where love` in PowerShell to find the actual path, then construct the alias using that path.
**Warning signs:** WSL alias runs but produces `No such file or directory`

### Pitfall 3: Audio Fails Silently on Windows
**What goes wrong:** Love2D opens a window but produces no sound. No error is shown.
**Why it happens:** OpenAL may not initialize properly on some Windows audio configurations; default audio device may not be set.
**How to avoid:** The test project must explicitly call `beep:play()` in `love.load()` and confirm the user hears a tone. Visual-only checks are insufficient.
**Warning signs:** Window opens, no error, but no beep heard — must be treated as a failure requiring diagnosis before proceeding.

### Pitfall 4: push.lua Error `attempt to call field 'getPixelScale' (a nil value)`
**What goes wrong:** Running any CS50G project that uses the old push.lua crashes immediately.
**Why it happens:** CS50G repos ship push.lua targeting Love2D 0.10.x. `getPixelScale` was removed in Love2D 11.0.
**How to avoid:** Always use push.lua from `Ulydev/push` master branch. Replace the file in the template before copying to any project.
**Warning signs:** Error on line ~101 of push.lua referencing `getPixelScale`

### Pitfall 5: ADB Deployment Blocked by Android Scoped Storage (Android 10+)
**What goes wrong:** `adb shell am start ... -d "file:///sdcard/game.love"` fails with permission error or does nothing.
**Why it happens:** Android 10+ restricts app access to `/sdcard/` root; the intent launch method stopped working in newer LOVE for Android builds (post-11.5).
**How to avoid:** Determine Android version first. Android 10+: push to lovegame folder and manually launch the app. Do NOT assume the intent method works.
**Warning signs:** ADB push succeeds but phone shows no activity, or an error toast appears

### Pitfall 6: CS50G Repos Cloned to Wrong Location
**What goes wrong:** Repos cloned inside WSL home (`~/`) instead of the Windows filesystem (`/mnt/c/...`).
**Why it happens:** Default `git clone` behavior uses current directory; if run from WSL home, files land there.
**How to avoid:** `cd` to `/mnt/c/Users/Trynda/Desktop/Dev/Lua/course/` before cloning. Verify with `pwd` before any `git clone`.
**Warning signs:** Repos appear in WSL `~/` and are not visible from Windows Explorer

### Pitfall 7: ADB Port 5037 Conflict
**What goes wrong:** `adb devices` hangs or returns an error about the daemon.
**Why it happens:** If a previous ADB process is running (e.g., from a previous session or Android Studio), the new call conflicts on port 5037.
**How to avoid:** Before testing ADB, run `adb kill-server` then `adb start-server`. This ensures a clean daemon.
**Warning signs:** `error: cannot connect to daemon` or long hang on `adb devices`

---

## Code Examples

Verified patterns from official/authoritative sources:

### Programmatic Audio Beep (No External File Needed)
```lua
-- Source: Love2D wiki - love.sound.newSoundData
-- Generates a 440Hz sine wave tone for audio verification
function love.load()
    local sampleRate = 44100
    local duration = 0.3
    local data = love.sound.newSoundData(
        math.floor(sampleRate * duration),
        sampleRate,
        16,    -- bit depth
        1      -- channels (mono)
    )
    for i = 0, data:getSampleCount() - 1 do
        local t = i / sampleRate
        data:setSample(i, 0.5 * math.sin(2 * math.pi * 440 * t))
    end
    local source = love.audio.newSource(data)
    source:play()
end
```

### Standard main.lua Skeleton (Template)
```lua
-- main.lua
-- Standard skeleton for all CS50G projects

function love.load()
    -- Initialize game state here
end

function love.update(dt)
    -- Update game logic (dt = delta time in seconds)
end

function love.draw()
    -- Render everything here
end

function love.keypressed(key)
    if key == "escape" then
        love.event.quit()
    end
end
```

### Standard conf.lua (1280x720, vsync on)
```lua
-- conf.lua
-- Source: Love2D wiki - Config Files
function love.conf(t)
    t.window.title    = "Game"
    t.window.width    = 1280
    t.window.height   = 720
    t.window.vsync    = 1        -- integer in Love2D 11.x (1 = enabled)
    t.window.resizable = false
    -- Hides the default console on Windows (keep false during dev for error output)
    t.console         = true
end
```

### Packaging .love File (WSL / bash)
```bash
# From inside the project directory (projects/00-test/)
# Creates a .love file = zip with main.lua at root
cd /mnt/c/Users/Trynda/Desktop/Dev/Lua/projects/00-test
zip -r ../../test-game.love . -x "*.git*" -x "*.DS_Store"
# Result: /mnt/c/Users/Trynda/Desktop/Dev/Lua/test-game.love
```

### ADB Deployment Commands
```bash
# Determine Android version first:
adb shell getprop ro.build.version.release

# Android 10+ (recommended path):
adb push test-game.love "/sdcard/Android/data/org.love2d.android/files/games/lovegame/test-game.love"
# Then open LOVE for Android app manually on phone

# Android 6 and earlier (intent launch method):
adb push test-game.love /sdcard/test-game.love
adb shell am start -S -n "org.love2d.android/.GameActivity" -d "file:///sdcard/test-game.love"
```

### CS50G Repo Clone Commands
```bash
# Clone all 8 Love2D repos into numbered course/ subdirectories
cd /mnt/c/Users/Trynda/Desktop/Dev/Lua/course

git clone https://github.com/games50/pong.git          01-pong
git clone https://github.com/games50/fifty-bird.git    02-flappy-bird
git clone https://github.com/games50/breakout.git      03-breakout
git clone https://github.com/games50/match3.git        04-match3
git clone https://github.com/games50/mario.git         05-mario
git clone https://github.com/games50/zelda.git         06-zelda
git clone https://github.com/games50/angrybirds.git    07-angry-birds
git clone https://github.com/games50/pokemon.git       08-pokemon
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `love.window.getPixelScale()` | `love.window.getDPIScale()` | Love2D 11.0 (2018) | CS50G push.lua crashes on 11.x without the fix |
| `adb shell am start` intent launch | lovegame folder + manual launch | Android 10 / LOVE Android ~11.4+ | Intent launch no longer works on modern Android |
| `t.window.vsync = true` | `t.window.vsync = 1` | Love2D 11.0 | Boolean vsync was replaced with integer; 1 = on |

**Deprecated/outdated:**
- `love.window.getPixelScale`: Removed in Love2D 11.0 — replaced by `love.window.getDPIScale` and `love.graphics.getDPIScale`
- Old `adb shell am start` intent launch for .love files: Only works Android 6 and earlier
- `/sdcard/lovegame` directory: Works on Android Pie and earlier; moved to scoped storage path on Android 10+

---

## Open Questions

1. **Android version on user's phone**
   - What we know: Phase 1 requires ADB end-to-end test; deployment method differs between Android 6- and Android 10+
   - What's unclear: The user's phone Android version is unknown; it determines whether the intent launch method or lovegame-folder method applies
   - Recommendation: Planner should include a step to run `adb shell getprop ro.build.version.release` as the FIRST ADB action; document both paths; plan must handle both

2. **Love2D already installed on Windows**
   - What we know: CONTEXT.md says "check if Love2D 11.5 is already installed; download and install if not"
   - What's unclear: If a different version (e.g., 11.3 or 12.x) is present, the plan needs to address version mismatch
   - Recommendation: Plan should check `love --version` first; if any version other than 11.5.x is present, guide the user to install 11.5 alongside or replace it

3. **platform-tools installation path on Windows**
   - What we know: The user should install to a known, stable path; the WSL alias must point to the exact path
   - What's unclear: User preference for installation location (C:\platform-tools\ vs. C:\Users\...\AppData\...)
   - Recommendation: Planner should designate a canonical path (e.g. `C:\tools\platform-tools\`) and the plan's alias step should use that path; the user must verify it matches

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — Phase 1 is manual verification of installed tools |
| Config file | none |
| Quick run command | `love.exe --version` (Windows) / `love --version` (WSL alias) |
| Full suite command | See Phase Gate below |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Command / Action | Automated? |
|--------|----------|-----------|-------------------------------|------------|
| ENV-01 | Love2D 11.5 installed and version verified | smoke | `love --version` prints `11.5.x` | manual-check |
| ENV-02 | Lua 5.1, LuaJIT, LuaRocks installed in WSL | smoke | `lua5.1 -v`, `luajit -v`, `luarocks --version` | manual-check |
| ENV-03 | Window opens + audio plays on Windows natively | smoke | Run `projects/00-test/` with `love.exe`; see window, hear beep | manual-verify |
| ENV-04 | All 8 CS50G repos cloned to `course/` | smoke | `ls course/` shows 01-pong through 08-pokemon | manual-check |
| ENV-05 | push.lua compatibility fix applied | smoke | Run a CS50G Pong project; no `getPixelScale` error | manual-verify |
| ENV-06 | Workspace directories and template in place | smoke | `ls projects/_template/` shows main.lua, conf.lua, lib/, assets/, src/ | manual-check |
| ENV-07 | ADB callable from WSL, end-to-end device test | smoke | `adb devices` lists device; .love file opens on phone | manual-verify |

**Justification for manual-only:** Phase 1 has no code to unit-test. All requirements are environmental checks — tool presence, correct versions, hardware interaction (audio, display, Android device). Automated test scripts cannot substitute for the human verifying a window appears and a sound is heard.

### Sampling Rate
- **Per task commit:** Run the verification command(s) for that task's requirement(s)
- **Per wave merge:** All 7 ENV-XX verifications must pass
- **Phase gate:** All manual verifications documented as passing before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements (there is no test framework to install; verification is manual by design).

---

## Sources

### Primary (HIGH confidence)
- `https://github.com/love2d/love/releases` — Love2D 11.5 release date (Dec 2023), Windows installer and zip URLs confirmed
- `https://github.com/Ulydev/push` — push.lua master branch; getDPIScale/getPixelScale compatibility conditional verified via community issue references
- `https://github.com/games50` — Official CS50G org; all 8 Love2D repo names confirmed (pong, fifty-bird, breakout, match3, mario, zelda, angrybirds, pokemon)
- `https://developer.android.com/tools/releases/platform-tools` — Android platform-tools official download page
- `https://github.com/love2d/love-android/wiki/FAQ---Frequently-Asked-Questions` — ADB push and launch methods; Android 10+ scoped storage limitation confirmed

### Secondary (MEDIUM confidence)
- Love2D forums `viewtopic.php?t=86162` — CS50G pong getPixelScale error; confirmed real-world symptom
- Love2D forums `viewtopic.php?t=88716` — push.lua:101 error on Love2D 11.x; confirmed fix approach
- `https://github.com/love2d/love-android/issues/194` — Scoped storage changes for /sdcard/lovegame in Android 10
- WSL alias patterns — Multiple sources confirm `/mnt/c/.../program.exe` alias approach; standard WSL2 behavior

### Tertiary (LOW confidence)
- ADB intent launch on Android 11/12 behavior — Documented as broken post-Android 10 but exact LOVE for Android app version where this changed is not precisely confirmed; test required
- Chocolatey Love2D package — Available but not recommended (version may lag; installer is authoritative)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Love2D 11.5, Lua/LuaJIT/LuaRocks via apt, Android platform-tools are all standard, well-documented tools
- Architecture: HIGH — WSL alias pattern, project directory structure, push.lua fix are established and verified
- Pitfalls: HIGH — getPixelScale error, ADB scoped storage limitation, PATH issues are real confirmed failures from community sources
- ADB Android 10+ exact behavior: MEDIUM — direction is clear (lovegame folder), but exact launch protocol may need on-device testing

**Research date:** 2026-03-12
**Valid until:** 2026-09-12 (stable tooling; Love2D 11.5 is a specific pinned version)
