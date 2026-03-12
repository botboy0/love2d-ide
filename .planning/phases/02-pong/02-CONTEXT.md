# Phase 2: Pong - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

A complete Pong game rebuilt from scratch by studying all 13 incremental CS50G versions (pong-0 through pong-12), with the CS50G "AI Update" assignment completed. Establishes the standard project template that all future games will follow. The rebuild IS the learning — pain points and IDE feature ideas are captured in a dev log.

</domain>

<decisions>
## Implementation Decisions

### Study approach
- Read and rebuild ALL 13 CS50G Pong versions sequentially (pong-0 through pong-12 + pong-final)
- User writes the code themselves; Claude acts as reference/helper (explains concepts, answers questions, debugs)
- DEVLOG.md in `projects/01-pong/` captures issues encountered and IDE feature ideas per version
- The rebuild itself is the proof of understanding — no separate study document

### Visual style
- Retro pixel-art style matching CS50G exactly (bitmap font, nearest-neighbor scaling via push.lua)
- Tightly hug the course for Pong and the first few projects
- Use CS50G's sound files; user will tinker with audio on their own and log experience in DEVLOG.md
- Win condition: first to 10 points, matching CS50G

### AI paddle
- Implement exactly what the CS50G "AI Update" assignment specifies
- AI behavior, paddle selection, and mode toggling all match the assignment spec
- Study the assignment requirements during the rebuild process, not pre-decided here

### Code architecture
- OOP pattern using class.lua (Ball and Paddle classes), matching CS50G's approach
- class.lua and push.lua go in `lib/` (template convention, not CS50G root)
- Ball.lua and Paddle.lua go in `src/` (game-specific code separated from reusable libs)
- Font and sounds go in `assets/` (assets/fonts/, assets/sounds/) — template convention
- Project lives in `projects/01-pong/` using the established template structure

### Claude's Discretion
- Exact DEVLOG.md format and section structure
- How to organize the incremental rebuild (git tags per version, folders, or single evolving codebase)
- Require path adjustments for the lib/ and src/ folder structure

</decisions>

<specifics>
## Specific Ideas

- "For the first few projects we will tightly hug the course" — visual style, game mechanics, and architecture should closely follow CS50G
- "I will rebuild it step by step myself and just document the issues I had and things I wish I had that we can implement into the IDE" — the dev log feeds directly into Phase 3 (IDE) feature planning
- User writes code, Claude helps — this is a learning-first project, not a code-generation project

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `projects/_template/`: main.lua skeleton, conf.lua with CS50G defaults (1280x720, vsync), lib/, assets/, src/ folders
- `projects/_template/lib/push.lua`: Already patched for Love2D 11.x — ready to use
- `course/01-pong/pong-final/`: Complete reference with Ball.lua, Paddle.lua, class.lua, font.ttf, sounds/
- `course/01-pong/pong-0` through `pong-12`: All 13 incremental lecture versions available for study

### Established Patterns
- Project template: main.lua + conf.lua at root, lib/ for libraries, assets/ for media, src/ for game code
- push.lua virtual resolution: 1280x720 with nearest-neighbor filtering
- conf.lua uses integer vsync (1) for Love2D 11.x compatibility

### Integration Points
- `projects/01-pong/` is the target directory — copy from `_template/` to start
- DEVLOG.md pain points will inform Phase 3 (IDE Shell) feature prioritization
- Project template pattern established here will be reused for all subsequent CS50G game rebuilds

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-pong*
*Context gathered: 2026-03-12*
