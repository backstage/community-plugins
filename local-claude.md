# Executive Instruction for Claude Code

## Purpose
This document is the executive instruction for Claude Code. Its job is to establish a controlled instruction system for this repository before any implementation work begins.

Claude must use this file as the top-level directive and then create a small, organized set of additional Markdown instruction files for downstream use. The goal is to make future Claude-assisted work structured, auditable, and scoped correctly.

## Primary Goals
Claude must do all of the following:

1. Scan the repository for any pre-existing Claude-related instruction files, agent instructions, AI contribution guidance, or workflow notes that may already define how AI tools should behave.
2. Summarize what already exists before creating new instruction files.
3. Create a layered instruction structure consisting of:
   - one general instruction file,
   - one agent-level instruction file,
   - one or more sub-agent instruction files as needed,
   - and one progress log file.
4. Keep all new files narrowly scoped, readable, and easy to maintain.
5. Avoid changing unrelated repository files while performing this work.

## Non-Negotiable Rules
- Only create or edit files necessary for this instruction system.
- Do not refactor unrelated files.
- Do not modify application code, configs, docs, CI, or devcontainer files unless explicitly required by this task.
- If a relevant instruction file already exists, prefer extending or aligning with it instead of creating redundant duplicates.
- Keep the output minimal and structured.
- Use Markdown for all instruction and log files.

## Required First Step
Before creating any new files, Claude must scan the entire codebase for pre-existing instruction artifacts related to Claude, AI usage, agents, workflows, or contribution constraints.

### Scan targets
Claude should search for file names, directory names, and content patterns including:
- `CLAUDE.md`
- `claude.md`
- `AGENTS.md`
- `agents.md`
- `.claude/`
- `.github/`
- `CONTRIBUTING.md`
- any docs mentioning Claude Code, AI usage, agents, automation rules, repo instructions, or contribution restrictions
- any prompt, playbook, governance, workflow, or policy files relevant to AI-assisted development

### Expected output from the scan
Claude must produce a short findings summary that includes:
- files found,
- why each one matters,
- whether it should be reused, referenced, or left untouched,
- and any conflicts or overlaps with the new instruction system.

If no relevant files are found, Claude should explicitly state that.

## Files Claude Should Create
Claude should create a small hierarchy like this, unless the repository already has an equivalent structure:

```text
.claude/
  executive-instruction.md
  general-instructions.md
  agent-instructions.md
  sub-agents/
    docs-agent.md
    repo-scan-agent.md
  logs/
    progress-log.md
```

The exact names can be adjusted to fit existing repository conventions, but the structure should remain clear and hierarchical.

## File Requirements

### 1. General instruction file
This file should define shared rules that apply to all Claude work in the repository.

It should include:
- repository-safe editing behavior,
- minimal-diff expectations,
- rules for preserving existing style,
- how to handle ambiguity,
- when to stop and ask questions,
- how to report changes,
- and how to avoid unrelated edits.

### 2. Agent-level instruction file
This file should define how Claude should operate when acting as the main execution agent for repository tasks.

It should include:
- how to read the executive instruction first,
- how to consult scan findings,
- how to delegate to sub-agents,
- how to respect repository policies,
- how to sequence work,
- and how to verify that output stays within scope.

### 3. Sub-agent instruction files
Claude should create sub-agent instructions only where useful.

At minimum, create:
- a repo-scan sub-agent instruction for discovering existing guidance and constraints,
- a docs sub-agent instruction for writing or updating Markdown files conservatively.

Each sub-agent file should include:
- role,
- scope,
- inputs,
- outputs,
- constraints,
- and escalation rules.

### 4. Progress log file
Claude must create a progress log file that records work performed during this setup.

The log should include:
- date/time,
- task performed,
- files reviewed,
- files created or updated,
- key findings,
- open questions,
- next step.

The progress log should be append-only unless explicitly asked to reorganize it.

## Execution Order
Claude should follow this order exactly:

1. Read any repository-level contribution and AI policy files already present.
2. Scan the codebase for existing Claude-, AI-, or agent-related instructions.
3. Summarize scan findings.
4. Propose the final instruction file structure.
5. Create the general instruction file.
6. Create the agent instruction file.
7. Create the sub-agent instruction files.
8. Create the progress log file.
9. Record the work in the progress log.
10. Stop and report what was created.

## Output Requirements
At the end, Claude should return:
- the files it found during the scan,
- the files it created,
- a short explanation of the purpose of each new file,
- and confirmation that no unrelated files were changed.

## Strict Scope Constraint
For this task, Claude is only setting up the instruction system. Claude is not authorized to begin broader repository edits, docs rewrites, code changes, or cleanup beyond the instruction files and any minimal alignment needed with pre-existing instruction artifacts.

## Repository Context
Respect existing repository guidance. This repository already has a `CONTRIBUTING.md` that defines contribution workflow, coding guidance, and points contributors to the upstream Backstage AI Use Policy and Guidelines. New Claude instruction files must not contradict those rules.