---
phase: 01-environment
plan: 03
subsystem: infra
tags: [adb, android, love2d, deployment, wsl]

# Dependency graph
requires:
  - phase: 01-environment
    provides: "Love2D 11.5 test project (projects/00-test/) with main.lua and conf.lua verified working"
provides:
  - "ADB callable from WSL via alias to Windows adb.exe at AppData/Local/Android/Sdk path"
  - "Full Android deployment chain proven: zip as .love -> adb push -> content:// URI intent launch"
  - "Discovery: Android 15 requires MediaStore content:// URI, not file:// URI, for LOVE intent launch"
affects:
  - phase-4-android-deployment

# Tech tracking
tech-stack:
  added: [adb (Android Debug Bridge via Windows platform-tools)]
  patterns:
    - "ADB deployed via WSL alias pointing to Windows adb.exe (not usbipd-win)"
    - "Android 15 deployment: push to /sdcard/lovegame/, query MediaStore for content URI, launch via am start with --grant-read-uri-permission"

key-files:
  created: []
  modified:
    - "~/.zshrc — ADB alias added pointing to AppData/Local/Android/Sdk/platform-tools/adb.exe"

key-decisions:
  - "ADB found at AppData/Local/Android/Sdk/platform-tools/adb.exe (Android Studio install), not C:\\platform-tools\\"
  - "Android 15 scoped storage requires MediaStore content:// URI for LOVE intent launch — file:// URI silently fails"
  - "Deployment sequence: push to /sdcard/lovegame/, query MediaStore _id, launch via content://media/external/file/{id} with --grant-read-uri-permission"
  - "LOVE Loader (not LOVE for Android official) was the working app on device — accepted same deployment method"

patterns-established:
  - "ADB from WSL: alias to Windows adb.exe, wireless debugging at device IP:port"
  - "Android 15 .love deploy: adb push -> content query -> am start with content URI"

requirements-completed: [ENV-07]

# Metrics
duration: ~30min
completed: 2026-03-12
---

# Phase 1 Plan 03: Android Deployment Chain Summary

**ADB alias configured in WSL pointing to Android Studio's adb.exe, Android 15 scoped storage workaround discovered and verified: push .love to /sdcard/lovegame/, resolve MediaStore content URI, launch via am start with --grant-read-uri-permission**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-12
- **Completed:** 2026-03-12
- **Tasks:** 2 (1 auto + 1 human-verify)
- **Files modified:** 1 (~/.zshrc)

## Accomplishments
- ADB accessible from WSL via alias to `C:\Users\Trynda\AppData\Local\Android\Sdk\platform-tools\adb.exe` (Android Studio installation — no separate platform-tools download needed)
- Test game (projects/00-test/) packaged as .love and deployed to Android 15 device at 192.168.178.79:34779 via wireless debugging
- Android 15 scoped storage limitation discovered and solved: file:// URI intent launch silently fails; MediaStore content:// URI with --grant-read-uri-permission is the working method
- Human-verified: blue screen and beep confirmed on Android device via LOVE Loader app

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure ADB alias and package test game for Android** - `b09bef3` (chore)
2. **Task 2: Verify test game runs on Android phone** - human-verified (no code commit — checkpoint task)

## Files Created/Modified
- `~/.zshrc` — ADB alias added: `alias adb='/mnt/c/Users/Trynda/AppData/Local/Android/Sdk/platform-tools/adb.exe'`

## Decisions Made

**ADB location:** Android Studio's built-in platform-tools at `AppData\Local\Android\Sdk\platform-tools\adb.exe` was already present — no separate download required. Alias path adjusted accordingly.

**Android 15 scoped storage workaround:** The plan's suggested deployment methods (lovegame folder for Android 10+, file:// URI for older) both fail on Android 15. Discovered working method:
1. `adb push test-game.love /sdcard/lovegame/`
2. Query MediaStore: `content query --uri content://media/external/file --projection _id --where "_data='/storage/emulated/0/lovegame/test-game.love'"`
3. Launch: `am start -a android.intent.action.VIEW -t 'application/x-love-game' -d 'content://media/external/file/{ID}' -n 'org.love2d.android/.GameActivity' --grant-read-uri-permission`

This must be used for all Phase 4 Android deployment automation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Android 15 deployment method differs from plan**
- **Found during:** Task 1 (Configure ADB alias and package test game for Android)
- **Issue:** Plan specified `org.love2d.android/files/games/lovegame/` path and file:// URI launch — both fail on Android 15 due to scoped storage enforcement
- **Fix:** Used `/sdcard/lovegame/` push path + MediaStore content URI resolution + `--grant-read-uri-permission` flag on am start
- **Files modified:** None (command-line only)
- **Verification:** Human confirmed blue screen + beep on device
- **Committed in:** b09bef3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (deployment method adaptation for Android 15)
**Impact on plan:** Essential fix — the plan's documented methods do not work on Android 15. Discovered and documented the working pattern for Phase 4 use.

## Issues Encountered
- ADB not at `C:\platform-tools\` (plan's assumed default) — found instead at Android Studio SDK path. Resolved by searching common locations.
- Android 15 scoped storage prevents file:// URI intent launch silently. Resolved by using MediaStore content URI approach.
- Device required wireless debugging (not USB) — connected at 192.168.178.79:34779.

## User Setup Required
None - no additional external service configuration required. ADB was already available via Android Studio installation.

## Next Phase Readiness
- Phase 1 (Environment) complete — all 3 plans done
- Android deployment chain fully proven with Android 15-compatible method documented
- Phase 4 Android deployment must use the MediaStore content URI method (not file:// URI)
- Device wireless debug address: 192.168.178.79:34779 (may change if device reconnects)

---
*Phase: 01-environment*
*Completed: 2026-03-12*
