See `/AGENTS.md` for full repository structure, code standards, development flow, and contribution guidelines.

## Pull Request Reviews

When reviewing pull requests, follow these rules:

### Do NOT Review Automated PRs

Skip reviews entirely for pull requests authored by any of these bot accounts:

- **renovate[bot]** (dependency update bot)
- **dependabot[bot]** (dependency update bot)
- **backstage-service** (automated Backstage service account)
- **backstage-goalie[bot]** (automated Backstage service account)
- **github-actions[bot]** (automated GitHub Actions workflows)

These PRs are managed through their own automated workflows and do not require code review from Copilot.

### Review Guidelines

When reviewing human-authored pull requests:

- Verify that changes are scoped to a single workspace where possible.
- Check that a changeset is included for any changes to published packages.
- Confirm that new TypeScript and JavaScript source files (`.ts`, `.tsx`, `.js`, `.jsx`) include the Apache 2.0 copyright header with the current year.
- Confirm that existing source files have NOT had their copyright year updated.
- Check that the PR description follows the template from `/.github/PULL_REQUEST_TEMPLATE.md`.
- Verify that commits include `Signed-off-by` lines (DCO).
- Check for consistent code style within the workspace being modified.
- Verify tests are included for new functionality and bug fixes.
- Check that ESLint, Prettier, and TypeScript configs are not modified unless the PR explicitly states that as its purpose.

### Backstage Version Bumps

Backstage version bumps (changes to `backstage.json`, `@backstage/*` dependency versions) must be done in isolation. Flag PRs that mix a Backstage version bump with other unrelated changes — the version bump should be its own separate PR.

### Local Development Setup

Plugins should use the `dev/index.ts` (or `dev/index.tsx`) pattern for local development instead of including a full Backstage example app (`packages/app` and `packages/backend`). See the [linguist workspace](https://github.com/backstage/community-plugins/tree/main/workspaces/linguist) for a good example of the `dev/index` pattern. Flag PRs that add a full example app when the `dev/index` pattern would suffice.

### New Workspace PRs

When reviewing a PR that introduces a brand new workspace:

- Verify that the PR includes a change to the `/CODEOWNERS` file adding the workspace's maintainers as codeowners for the new workspace.
- Verify that all new plugin packages have `"version": "0.0.0"` in their `package.json` as the initial version.
