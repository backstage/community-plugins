# Executive Instruction

This file is the top-level directive for all Claude-assisted work in `backstage/community-plugins`.

## Source

Derived from `local-claude.md` in the repository root.

## Authority

This file takes precedence over all other Claude instruction files in this repository. Conflicts must be resolved in favor of this file, then `CONTRIBUTING.md`, then any workspace-level guidance.

## Governing Constraint

This repository follows the same [AI Use Policy and Guidelines as the upstream Backstage project](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#ai-use-policy-and-guidelines). All Claude work must comply with that policy.

## Instruction Hierarchy

```
.claude/
  executive-instruction.md   ← this file (top-level authority)
  general-instructions.md    ← shared rules for all Claude work
  agent-instructions.md      ← rules for Claude acting as main execution agent
  sub-agents/
    repo-scan-agent.md       ← discovers existing guidance and constraints
    docs-agent.md            ← writes or updates Markdown files conservatively
  logs/
    progress-log.md          ← append-only record of work performed
```

## Non-Negotiable Rules

1. Only create or edit files necessary for the assigned task.
2. Do not refactor unrelated files.
3. Do not modify application code, configs, docs, CI, or devcontainer files unless explicitly required.
4. If a relevant instruction file already exists, prefer extending it over creating a duplicate.
5. Keep output minimal and structured.
6. Use Markdown for all instruction and log files.
7. Never contradict `CONTRIBUTING.md` or the upstream Backstage AI Use Policy.

## Reading Order

Before beginning any task, Claude must read:

1. This file (`executive-instruction.md`)
2. `general-instructions.md`
3. `agent-instructions.md` (when acting as main agent)
4. The relevant sub-agent file (when delegating)
5. `CONTRIBUTING.md` (for contribution workflow context)
