---
phase: 1
slug: environment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Phase 1 is manual verification of installed tools |
| **Config file** | none |
| **Quick run command** | `love --version` (WSL alias) |
| **Full suite command** | Run all 7 ENV-XX verification checks (see Per-Task map) |
| **Estimated runtime** | ~60 seconds (manual checks) |

---

## Sampling Rate

- **After every task commit:** Run the verification command(s) for that task's requirement(s)
- **After every plan wave:** All 7 ENV-XX verifications must pass
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | ENV-01 | manual-check | `love --version` prints 11.5.x | N/A | ⬜ pending |
| 01-01-02 | 01 | 1 | ENV-02 | manual-check | `lua5.1 -v`, `luajit -v`, `luarocks --version` | N/A | ⬜ pending |
| 01-02-01 | 02 | 1 | ENV-03 | manual-verify | Run `projects/00-test/` — see window, hear beep | N/A | ⬜ pending |
| 01-03-01 | 03 | 1 | ENV-04 | manual-check | `ls course/` shows 01-pong through 08-pokemon | N/A | ⬜ pending |
| 01-03-02 | 03 | 1 | ENV-05 | manual-verify | Run CS50G Pong — no getPixelScale error | N/A | ⬜ pending |
| 01-03-03 | 03 | 1 | ENV-06 | manual-check | `ls projects/_template/` shows expected structure | N/A | ⬜ pending |
| 01-03-04 | 03 | 1 | ENV-07 | manual-verify | `adb devices` lists device; .love opens on phone | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. There is no test framework to install; verification is manual by design.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Love2D window opens on Windows | ENV-03 | Hardware display — cannot be automated in CLI | Run `love projects/00-test/` and confirm colored window appears |
| Audio beep plays | ENV-03 | Hardware audio — requires human hearing | Listen for 440Hz beep when test project launches |
| ADB device connection | ENV-07 | Physical device — requires USB connection | Connect phone, run `adb devices`, confirm serial listed |
| .love file runs on Android | ENV-07 | Physical device — requires visual confirmation on phone | Push .love file, open LOVE app, confirm game runs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
