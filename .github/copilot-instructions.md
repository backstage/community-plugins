Backstage Community Plugins is a collection of open source plugins for [Backstage](https://backstage.io), an open platform for building developer portals. This is a TypeScript repository containing ~107 independent workspaces under `/workspaces/`, each functioning as its own self-contained Backstage project.

## Repository Structure

This is NOT a standard monorepo. Each workspace under `/workspaces/<name>/` is an independent Yarn project with its own `yarn.lock`, `node_modules`, and release cycle. The root `package.json` provides shared tooling (Prettier, Husky, workspace creation) but is not a Yarn workspace root for the plugin workspaces.

### Key Directories

- `/workspaces/<name>/`: Independent plugin workspaces (e.g., `/workspaces/linguist/`)
- `/workspaces/<name>/plugins/`: Plugin packages within a workspace (prefixed `@backstage-community/plugin-*`)
- `/workspaces/<name>/packages/`: Supporting packages (e.g., app, backend for local dev)
- `/.github/`: CI workflows, issue templates, CODEOWNERS
- `/scripts/`: Repository-level automation scripts

### Workspace Structure

Each workspace mirrors a minimal Backstage repository:

```
workspaces/<name>/
  plugins/             # Plugin packages
  packages/            # App/backend packages (if present)
  package.json         # Workspace root with scripts
  yarn.lock            # Independent lockfile
  backstage.json       # Backstage release version pin
  bcp.json             # CI feature flags (knipReports, autoVersionBump, etc.)
  tsconfig.json        # TypeScript config
  .changeset/          # Changesets for this workspace only
```

## Before Making Changes

Before starting work, check whether there is already an open pull request for the same change. Search existing PRs to avoid duplicating effort.

## Code Standards

- Follow the guidelines in `/CONTRIBUTING.md`.
- Follow the upstream [Backstage CONTRIBUTING.md](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md), [STYLE.md](https://github.com/backstage/backstage/blob/master/STYLE.md), and [REVIEWING.md](https://github.com/backstage/backstage/blob/master/REVIEWING.md).
- Match the existing coding style of each individual package and file. Different workspaces may have different conventions.
- When writing tests, prefer fewer thorough tests with multiple assertions over many small tests. When using React Testing Library, prefer `screen` and `.findBy*` queries over `waitFor`, and avoid adding test IDs to the implementation.
- Plugins are published under the `@backstage-community` npm scope and licensed under Apache 2.0.

### Copyright Headers

All source files must include an Apache 2.0 copyright header. When creating new files, use the current year:

```ts
/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
```

Do NOT update the copyright year on existing files. Leave the original year as-is.

## Development Flow

All commands are run from within a workspace directory (`/workspaces/<name>/`), NOT from the repository root.

```bash
# Navigate to the workspace
cd workspaces/<name>

# Install dependencies (also triggers root install via postinstall)
yarn install

# Run tests (always provide a path, avoid running all tests)
yarn test <path-to-test-file-or-directory>

# Type checking
yarn tsc

# Linting
yarn lint --fix

# Formatting
yarn prettier --write <...paths>

# API reports (required before submitting PRs with API changes)
yarn build:api-reports

# Start dev server (if configured for the workspace)
yarn start
```

Do NOT run `yarn install`, `yarn tsc`, `yarn lint`, or `yarn test` from the repository root for workspace work. Always navigate to the specific workspace first.

Do NOT run builds or create releases by running `yarn build`, `yarn changeset version`, or `yarn changeset publish`. Builds and releases are handled by CI workflows.

## Creating Changesets

All changes that affect published packages must include a changeset. Run `yarn changeset` from the workspace root and follow the prompts.

Changeset messages should be short and concise — they get rolled up into the changelog. Write them for Backstage adopters as the audience, describing user-facing behavior changes in plain language. Do not reference internal implementation details like function names or variable names.

For breaking changes, changeset messages should be longer and more detailed. Include what changed, why it is breaking, and what manual steps adopters need to take to migrate.

## Pull Requests

- Always use the PR template at `/.github/PULL_REQUEST_TEMPLATE.md`. Do NOT erase or remove the template — fill it in completely.
- PR descriptions should be short and concise. If there are extensive details to share (design rationale, migration context, investigation notes), suggest that the author open a GitHub issue first and link to it from the PR instead.
- All commits must include a `Signed-off-by` line (DCO requirement).
- The standard merge strategy is squash merge.
- Never update ESLint, Prettier, or TypeScript configuration files unless specifically requested.

## CI Pipeline

CI is defined in `/.github/workflows/ci.yml`. It detects changed workspaces and runs a matrix job per workspace. Each workspace job runs `yarn install --immutable`, type checking, linting, and tests. Some workspaces opt into additional CI features via `bcp.json` (Knip reports, Playwright tests, deprecation listing, auto version bumps).

## Pull Request Reviews

When reviewing pull requests, follow these rules:

### Do NOT Review Automated PRs

Skip reviews entirely for pull requests authored by any of these bot accounts:

- **renovate** / **Renovate** (dependency update bot)
- **dependabot** / **Dependabot** (dependency update bot)
- **backstage-service** (automated Backstage service account)
- **backstage-goalie** (automated Backstage service account)

These PRs are managed through their own automated workflows and do not require code review from Copilot.

### Review Guidelines

When reviewing human-authored pull requests:

- Verify that changes are scoped to a single workspace where possible.
- Check that a changeset is included for any changes to published packages.
- Confirm that new source files include the Apache 2.0 copyright header with the current year.
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

- Verify that the PR includes a change to the `/CODEOWNERS` file adding the PR author as a codeowner for the new workspace.
- Verify that all new plugin packages have `"version": "0.0.0"` in their `package.json` as the initial version.
