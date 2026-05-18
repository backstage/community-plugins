---
alwaysApply: true
---

See `AGENTS.md` for full repository structure, code standards, development flow, and contribution guidelines. This file contains Claude-specific instructions.

## Workspace-Scoped Work

When working on a workspace, always `cd` into it first. Treat each workspace as if it were its own repository:

- Run `yarn install` from the workspace root, not the repo root.
- Run `yarn tsc`, `yarn test`, `yarn lint` from the workspace root.
- Run `yarn prettier --write <...paths>` for specific changed files, not entire directories.
- Run `yarn build:api-reports` from the workspace root before submitting PRs with API changes.
- Run `yarn changeset` from the workspace root when creating changesets.

## Before Creating Pull Requests

Always check for existing open PRs that address the same issue:

```bash
gh pr list --search "<relevant keywords>"
```

## Changesets

Write changeset files directly to the workspace's `.changeset/` directory. Each changeset message should be written for Backstage adopters: describe user-facing behavior changes in plain language. Do not reference internal implementation details such as function names, class names, or variable names.

## What NOT to Do

- Do NOT run `yarn build`, `yarn changeset version`, or `yarn changeset publish`.
- Do NOT modify ESLint, Prettier, or TypeScript configuration files unless specifically requested.
- Do NOT update the copyright year on existing files.
- Do NOT run commands from the repository root when working on a specific workspace.
