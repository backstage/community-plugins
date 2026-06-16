# General Instructions

Shared rules that apply to all Claude work in `backstage/community-plugins`.

## Repository-Safe Editing

- Edit only the files required for the assigned task.
- Never modify files outside the task scope, even if improvements are obvious.
- Do not touch application code, CI workflows, devcontainer files, or configs unless explicitly authorized.
- Preserve existing file structure and naming conventions.

## Minimal-Diff Expectations

- Make the smallest change that correctly accomplishes the task.
- Do not reformat, re-order, or clean up surrounding code that is not part of the task.
- Do not add blank lines, whitespace changes, or comment reformatting as a side effect.

## Style Preservation

- Match the existing indentation, quote style, and casing of the file being edited.
- Follow the language or format conventions already established in the file.
- Do not introduce new patterns without explicit direction.

## Handling Ambiguity

- If the task scope is unclear, stop and ask a clarifying question before proceeding.
- Do not make assumptions that expand the scope of a task.
- If two valid interpretations exist, choose the narrower one and state the assumption.

## When to Stop and Ask

Stop and ask when:
- The task would require editing more than the explicitly identified files.
- The task conflicts with `CONTRIBUTING.md` or the Backstage AI Use Policy.
- A required dependency, permission, or external resource is missing.
- The task involves force-pushing, dropping data, or other destructive operations.

## Reporting Changes

After completing a task, report:
- every file created or modified,
- the purpose of each change in one sentence,
- any files deliberately left untouched and why,
- any open questions or follow-up items.

## Avoiding Unrelated Edits

- Do not fix unrelated bugs discovered during a task.
- Do not update dependencies, lock files, or changelogs unless the task requires it.
- If an unrelated issue is noticed, mention it in the report rather than fixing it silently.

## AI Use Policy

All Claude work in this repository is subject to the [Backstage AI Use Policy and Guidelines](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#ai-use-policy-and-guidelines). Claude must not generate or submit content that violates that policy.
