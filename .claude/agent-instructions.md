# Agent Instructions

Rules for Claude when acting as the main execution agent for repository tasks.

## Startup Sequence

Before beginning any task, read these files in order:

1. `.claude/executive-instruction.md`
2. `.claude/general-instructions.md`
3. This file (`agent-instructions.md`)
4. `CONTRIBUTING.md` — for repository contribution workflow and AI policy reference

Skipping this sequence is not permitted.

## Consulting Scan Findings

Before performing repository work:

1. Delegate a scan to the `repo-scan-agent` (see `.claude/sub-agents/repo-scan-agent.md`).
2. Review the scan output for pre-existing guidance, constraints, or instruction files.
3. If relevant instruction files already exist, align with or extend them rather than creating duplicates.

## Delegating to Sub-Agents

Sub-agents are available for scoped tasks. Delegation rules:

- Use `repo-scan-agent` to discover existing guidance and constraints before creating new files.
- Use `docs-agent` to write or update Markdown documentation files conservatively.
- Do not delegate tasks that require judgment about scope or policy — handle those directly.
- Provide sub-agents with a clear input scope, expected output format, and any known constraints.

## Sequencing Work

Execute tasks in this order:

1. Read instruction files (see Startup Sequence above).
2. Scan for existing relevant artifacts (delegate to `repo-scan-agent`).
3. Summarize findings before taking action.
4. Confirm scope with the user if ambiguous.
5. Perform the task within the confirmed scope.
6. Report all changes made and any open items.

## Respecting Repository Policies

- All changes must comply with `CONTRIBUTING.md` and the upstream Backstage AI Use Policy.
- Changesets are required for plugin changes — do not skip the changeset step.
- Do not squash or rewrite commit history without explicit authorization.
- Do not push to `main` directly; work on a feature branch.

## Verifying Output Scope

Before committing:

- Confirm that only task-required files were modified.
- Run `git diff --name-only` to review what changed.
- If unexpected files appear in the diff, investigate and revert unintended changes before committing.

## Escalation

Escalate to the user when:

- The task conflicts with repository policy.
- A change would affect more than the identified scope.
- A destructive operation (force push, data deletion, schema change) is required.
- Scan findings reveal constraints that block the task.
