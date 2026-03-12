# Phase 1: Environment - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up a fully verified Love2D development environment. Love2D runs as a Windows native application (not inside WSL). WSL2 is used only for Claude Code and CLI tooling. CS50G repos are cloned and browsable, workspace structure is established with a reusable project template, and ADB is configured and tested end-to-end by pushing a test game to an Android device.

</domain>

<decisions>
## Implementation Decisions

### Love2D execution model
- Love2D runs as Windows native (love.exe), NOT inside WSL2
- WSL2 is used for Claude Code, git, and CLI commands only — no WSLg dependency
- Create a WSL shell alias/wrapper to call Windows love.exe from WSL
- Check if Love2D 11.5 is already installed on Windows; download and install if not

### Verification approach
- Minimal test project: colored window + short beep sound
- Must confirm both display and audio work via Windows love.exe
- Kept permanently as `projects/00-test/` for future sanity checks after system updates
- Phase 1 BLOCKS if verification fails — no proceeding with broken display or audio
- LuaRocks: just verify `luarocks --version` works, no test package install needed

### CS50G repo organization
- Numbered folders under `course/`: 01-pong/, 02-flappy-bird/, 03-breakout/, etc.
- Each folder contains both lecture code AND assignment distribution code
- Matches CS50G lecture order for sequential navigation

### Workspace location and structure
- Workspace lives on Windows filesystem (this repo: /mnt/c/Users/Trynda/Desktop/Dev/Lua/)
- NOT in WSL home directory — everything Windows-side
- Directory structure: `course/`, `projects/`, `ide/`
- Create `projects/_template/` with skeleton files for new games

### Project template contents
- main.lua with love.load/update/draw skeleton
- conf.lua with CS50G defaults: 1280x720 virtual resolution, vsync on
- Folders: lib/, assets/, src/
- push.lua (patched for Love2D 11.x) pre-installed in lib/
- Template is copied to start each new game project

### ADB setup and verification
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

</decisions>

<specifics>
## Specific Ideas

- "Everything should run on Windows, I just use WSL for Claude Code and better commands" — this is the guiding principle for the entire project
- Verification test game doubles as the ADB push test — same project proves both Love2D and ADB work
- CS50G defaults (1280x720 virtual res) for the project template to stay familiar with the course

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — this is a fresh project with only .planning/ directory

### Established Patterns
- None yet — Phase 1 establishes the foundation

### Integration Points
- WSL alias for love.exe will be used by Phase 3 (IDE) to spawn Love2D processes
- WSL alias for adb.exe will be used by Phase 4 (Deploy) for one-click deployment
- Project template established here will be used by Phase 2 (Pong) as the starting point
- push.lua in template lib/ enables virtual resolution for all future game projects

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-environment*
*Context gathered: 2026-03-12*
