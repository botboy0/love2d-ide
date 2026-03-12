---
phase: 2
slug: pong
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Love2D games verified by manual play-through |
| **Config file** | N/A |
| **Quick run command** | `love projects/01-pong/` (via WSL alias to Windows love.exe) |
| **Full suite command** | `love projects/01-pong/` + manual play-through verification |
| **Estimated runtime** | ~10 seconds (launch + visual check) |

---

## Sampling Rate

- **After every task commit:** Run `love projects/01-pong/` — verify game launches
- **After every plan wave:** Manual play-through checklist (ball bounces, paddles move, score increments, AI moves, win screen)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PONG-01 | manual | N/A — DEVLOG.md review | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | PONG-02 | smoke | `love projects/01-pong/` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | PONG-03 | manual | Launch game and play | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | PONG-04 | manual | Launch and let AI play | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | PONG-05 | smoke | `ls projects/01-pong/` directory check | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `projects/01-pong/` — create by copying `projects/_template/` structure
- [ ] `projects/01-pong/DEVLOG.md` — create empty with version section headers
- [ ] Copy assets: `course/01-pong/pong-final/class.lua` → `projects/01-pong/lib/`
- [ ] Copy assets: `course/01-pong/pong-final/font.ttf` → `projects/01-pong/assets/fonts/`
- [ ] Copy assets: `course/01-pong/pong-final/sounds/` → `projects/01-pong/assets/sounds/`

*No automated test framework install required — manual verification is the appropriate method for this phase*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CS50G code studied and understood | PONG-01 | Learning is not automatable | Review DEVLOG.md for notes on each pong version |
| Ball physics and collision work | PONG-03 | Visual/interactive game behavior | Launch game, hit ball with paddles, verify bounce angles |
| AI paddle deflects ball | PONG-04 | Interactive AI behavior | Launch game in AI mode, observe AI paddle tracking ball |
| Score increments and win screen | PONG-03 | Visual game state | Play until score reaches 10, verify win screen appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
