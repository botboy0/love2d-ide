---
phase: 3
slug: web-ide
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node:test` (no install required) |
| **Config file** | none — scripts in `package.json` |
| **Quick run command** | `node --test ide/tests/*.test.js` |
| **Full suite command** | `node --test ide/tests/*.test.js` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test ide/tests/*.test.js`
- **After every plan wave:** Run `node --test ide/tests/*.test.js`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | IDE-01 | smoke | `node --test ide/tests/server.test.js` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | IDE-02 | unit | `node --test ide/tests/files.test.js` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | IDE-03 | unit | `node --test ide/tests/files.test.js` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 1 | IDE-04 | smoke | `node -e "require('fs').statSync('ide/public/editor.bundle.js')"` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | IDE-05 | manual | N/A — requires love.exe and display | manual | ⬜ pending |
| 03-05-01 | 05 | 2 | IDE-06 | unit | `node --test ide/tests/console.test.js` | ❌ W0 | ⬜ pending |
| 03-06-01 | 06 | 2 | IDE-07 | unit | `node --test ide/tests/watcher.test.js` | ❌ W0 | ⬜ pending |
| 03-07-01 | 07 | 2 | IDE-08 | unit | `node --test ide/tests/error-parser.test.js` | ❌ W0 | ⬜ pending |
| 03-08-01 | 08 | 2 | IDE-09 | unit | `node --test ide/tests/export.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `ide/tests/server.test.js` — covers IDE-01 (server binds and serves index.html)
- [ ] `ide/tests/files.test.js` — covers IDE-02, IDE-03 (file tree and read endpoints)
- [ ] `ide/tests/console.test.js` — covers IDE-06 (SSE emits data events)
- [ ] `ide/tests/watcher.test.js` — covers IDE-07 (chokidar polling fires callback)
- [ ] `ide/tests/error-parser.test.js` — covers IDE-08 (regex linkification)
- [ ] `ide/tests/export.test.js` — covers IDE-09 (archiver produces valid zip)
- [ ] `ide/package.json` — Node.js project manifest with test script

*Existing infrastructure covers IDE-04 via smoke check on built bundle file.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Run button spawns love.exe and game window appears | IDE-05 | Requires Windows display, love.exe binary, and real project | Click Run in IDE with a valid Love2D project open; verify game window opens |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
