# Progress Log

Append-only. Do not reorganize or delete entries.

---

## 2026-06-16T02:12:59Z — Initial instruction system setup

**Task performed:** Executed `local-claude.md` to establish the Claude instruction system for `backstage/community-plugins`.

**Files reviewed:**

| File | Notes |
|------|-------|
| `local-claude.md` | Executive instruction source; defines the full setup task |
| `CONTRIBUTING.md` | Defines contribution workflow and references the upstream Backstage AI Use Policy |
| `GOVERNANCE.md` | References external governance model; no AI-specific rules beyond CONTRIBUTING.md |
| `.claude/skills/mui-to-bui-migration/SKILL.md` | Existing Claude skill for MUI→BUI migration; left untouched |
| `.github/` | CI/CD workflows and GitHub templates; not AI-instruction related; left untouched |

**Files created:**

| File | Purpose |
|------|---------|
| `.claude/executive-instruction.md` | Top-level authority file; defines hierarchy, non-negotiable rules, and reading order |
| `.claude/general-instructions.md` | Shared rules for all Claude work: safe editing, minimal diff, style, ambiguity handling, reporting |
| `.claude/agent-instructions.md` | Rules for Claude acting as main execution agent: startup sequence, delegation, sequencing, policy compliance |
| `.claude/sub-agents/repo-scan-agent.md` | Sub-agent for discovering existing guidance and constraints; read-only |
| `.claude/sub-agents/docs-agent.md` | Sub-agent for writing or updating Markdown files conservatively |
| `.claude/logs/progress-log.md` | This file; append-only work record |

**Key findings:**

- No pre-existing `CLAUDE.md`, `AGENTS.md`, or `.claude/` instruction hierarchy was found.
- The existing `.claude/skills/` directory contains one skill (`mui-to-bui-migration`) and was left untouched.
- `CONTRIBUTING.md` references the upstream Backstage AI Use Policy; all new instruction files align with that policy and do not contradict it.

**Open questions:** None.

**Next step:** Instruction system is complete. Future Claude work in this repository should begin by reading `.claude/executive-instruction.md`.
