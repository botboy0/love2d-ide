---
phase: 02-pong
plan: "01"
subsystem: scaffold
tags: [love2d, lua, android, class.lua, assets]

# Dependency graph
requires: []
provides:
  - projects/01-pong/ scaffold with all assets, libraries, and DEVLOG.md
  - Verified pong-0 entry point running on Android (Love2D)
affects: [02-pong]

# Tech tracking
tech-stack:
  added: [class.lua (hump OOP), love2d native rendering APIs]
  patterns:
    - "Use love.graphics.getWidth/getHeight for screen centering — push.lua incompatible with Android LOVE"
    - "Android LOVE deploy: push .love to /sdcard/lovegame/, launch via MediaStore content URI"

key-files:
  created:
    - projects/01-pong/main.lua
    - projects/01-pong/conf.lua
    - projects/01-pong/lib/class.lua
    - projects/01-pong/assets/fonts/font.ttf
    - projects/01-pong/assets/sounds/paddle_hit.wav
    - projects/01-pong/assets/sounds/score.wav
    - projects/01-pong/assets/sounds/wall_hit.wav
    - projects/01-pong/DEVLOG.md
    - projects/01-pong/src/.gitkeep
  modified: []

key-decisions:
  - "push.lua dropped: causes black screen on Android LOVE — use love.graphics.getWidth/getHeight instead"
  - "Font size set to 24pt for mobile readability (original CS50G used 8pt for desktop virtual resolution)"

patterns-established:
  - "Native rendering pattern: query screen dimensions at load time, no virtual resolution wrapper"
  - "Project scaffold copied from _template, class.lua sourced from course/01-pong/pong-final/"

requirements-completed: [PONG-01, PONG-02, PONG-05]

# Metrics
duration: ~15min
completed: 2026-03-12
---

# Phase 2 Plan 01: Pong Scaffold Summary

**projects/01-pong/ scaffolded with all CS50G assets, class.lua, and DEVLOG stubs — verified running on Android LOVE with native rendering (push.lua dropped for Android compat)**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-12
- **Completed:** 2026-03-12
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify)
- **Files modified:** 9

## Accomplishments

- Created projects/01-pong/ with complete template structure (lib/, src/, assets/fonts/, assets/sounds/)
- Copied all CS50G reference assets: font.ttf, paddle_hit.wav, score.wav, wall_hit.wav, class.lua
- Initialized DEVLOG.md with section stubs for all 13 CS50G Pong versions
- Verified pong-0 baseline (window + "Hello Pong!" text) on Android phone
- Dropped push.lua dependency — discovered it causes black screen on Android LOVE, switched to native love.graphics.getWidth/getHeight for centering

## Task Commits

Each task was committed atomically:

1. **Task 1: Create project directory and copy assets/libraries** - `4270950` (feat)
2. **Task 2: Verify scaffold runs (Android verification + push.lua fix)** - `192152c` (fix)

## Files Created/Modified

- `projects/01-pong/main.lua` - pong-0 entry point; bare love.load/love.draw skeleton using native rendering
- `projects/01-pong/conf.lua` - Window config: 1280x720, vsync=1, t.console=true
- `projects/01-pong/lib/class.lua` - OOP library from hump/CS50G pong-final reference
- `projects/01-pong/lib/push.lua` - Copied from template (present but NOT used — kept as reference)
- `projects/01-pong/assets/fonts/font.ttf` - CS50G font
- `projects/01-pong/assets/sounds/paddle_hit.wav` - CS50G sound asset
- `projects/01-pong/assets/sounds/score.wav` - CS50G sound asset
- `projects/01-pong/assets/sounds/wall_hit.wav` - CS50G sound asset
- `projects/01-pong/DEVLOG.md` - Dev log with stubs for pong-0 through pong-final (13 versions)
- `projects/01-pong/src/.gitkeep` - Tracks empty src/ directory

## Decisions Made

- push.lua dropped from main.lua: requiring push.lua on Android LOVE produces a black screen (incompatible with Android's rendering context). Native love.graphics.getWidth/getHeight used instead for all screen-centering calculations.
- Font size increased to 24pt: CS50G defaults use 8pt on a 1280x720 virtual canvas via push.lua. Without virtual resolution, 8pt is unreadable on a phone screen — 24pt chosen for mobile readability.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Dropped push.lua to fix black screen on Android**
- **Found during:** Task 2 (human verification on Android phone)
- **Issue:** main.lua required push.lua at startup; Android LOVE rendered a black screen instead of the window
- **Fix:** Removed push.lua require and push:setupScreen call; replaced with love.graphics.getWidth/getHeight for centering; increased font size to 24pt for readability
- **Files modified:** projects/01-pong/main.lua
- **Verification:** Verified by user on Android phone — window opened, "Hello Pong!" displayed correctly
- **Committed in:** 192152c (fix commit after checkpoint verification)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** push.lua bypass is necessary for Android target — does not affect the incremental rebuild plan since pong-0 through pong-1 would introduce push.lua as a learning step anyway.

## Issues Encountered

- push.lua incompatible with Android LOVE runtime. The template included push.lua and the plan referenced it, but Android LOVE produces a black screen when push.lua is loaded. This is a known limitation of the virtual resolution library on mobile targets. The project now uses native rendering as the baseline.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- projects/01-pong/ is fully scaffolded and verified working on Android
- User can begin incremental CS50G Pong rebuild starting from pong-0
- Key constraint documented for future plans: push.lua is NOT available on Android — any plan introducing virtual resolution must note this and offer an alternative rendering path
- DEVLOG.md is ready for user to fill in as they work through each version

---
*Phase: 02-pong*
*Completed: 2026-03-12*
