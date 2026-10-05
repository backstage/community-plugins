# Renovate Configuration

This document describes how Renovate is configured for the community-plugins repository. The configuration lives in `.github/renovate.json`.

## Overview

Renovate automatically creates pull requests to keep dependencies up to date. Because this repository contains ~107 independent workspaces under `/workspaces/`, the configuration is designed to scope updates per workspace and enforce version constraints for packages that are not compatible with the Backstage framework.

The [Dependency Dashboard][dependency-dashboard] issue tracks all pending and open Renovate PRs and is the place where maintainers approve gated updates (such as major version bumps).

## Package Rule Ordering

Renovate evaluates `packageRules` in order. When multiple rules match the same package, later rules merge into earlier ones and take precedence on conflicting properties. This means the order of rules matters:

1. **General rules** — broad disabling or grouping rules (e.g., disable `@backstage/*`, disable `@material-ui/*` replacements)
2. **Workspace grouping rules** — group updates per workspace, then override grouping for maintainer-owned workspaces
3. **Version pin rules** — restrict specific packages to allowed version ranges (e.g., `node-fetch <3`, `typescript ~5.3`, `react-router <7`)
4. **Update type rules** — control behavior for categories of updates (e.g., require dashboard approval for major updates)

Version pin rules come after workspace grouping rules so that version constraints take precedence over grouping behavior. This is especially important for packages like `react-router` where the `vulnerabilityAlerts.enabled: false` setting must not be overridden by a later grouping rule.

When adding new rules, place them in the appropriate section to maintain this ordering.

## Key Behaviors

### Per-Workspace PRs

Each workspace under `/workspaces/<name>/` gets its own Renovate PR for dependency updates, using the naming pattern `workspace/<name> dependencies`. This keeps updates scoped and allows workspace owners to review and merge independently.

### Maintainer-Owned Workspaces

A subset of workspaces are maintained by the area maintainers team. Updates for these workspaces are batched into a single combined PR (`maintainer-owned workspace dependencies`) to reduce PR volume.

### Backstage Dependencies

All `@backstage/*` packages are disabled in Renovate. These are managed through the Backstage version bump process, which has its own workflow and PR cadence.

### Version Pins

Several packages are pinned to specific version ranges because newer major versions are incompatible with the current Backstage build setup:

| Package                            | Allowed Versions | Reason                                         |
| ---------------------------------- | ---------------- | ---------------------------------------------- |
| `node-fetch`                       | `<3.0.0`         | v3 is ESM-only                                 |
| `typescript`                       | `~5.3.0`         | Must match Backstage framework version         |
| `yn`                               | `<5.0.0`         | v5 is ESM-only                                 |
| `react-router`, `react-router-dom` | `<7.0.0`         | Backstage does not yet support React Router v7 |

### Major Version Updates

Major version updates require manual approval on the [Dependency Dashboard][dependency-dashboard] before Renovate creates a PR. This prevents a flood of major version PRs and lets maintainers opt in to specific upgrades on their own schedule.

### Lock File Maintenance

Lock file maintenance PRs are disabled. Each workspace has its own `yarn.lock`, and bulk lock file updates can introduce unexpected breakage across workspaces. Lock files are updated naturally as part of regular dependency update PRs.

### Vulnerability Alerts

Vulnerability alerts are enabled globally. For packages with version pins (like `react-router`), vulnerability alerts are explicitly disabled when the security fix is available on the pinned version line — otherwise Renovate would create PRs to upgrade past the allowed version range.

## Modifying the Configuration

When updating the Renovate config:

- Maintain the rule ordering described above
- Add a `description` field to any new `packageRules` entry
- Test changes by checking the Dependency Dashboard after merging — Renovate reflects config changes on its next run
- If closing Renovate PRs, do so **after** the config change has merged to avoid Renovate recreating them
- Check the [Dependency Dashboard][dependency-dashboard] after merging to verify the changes took effect

[dependency-dashboard]: https://github.com/backstage/community-plugins/issues/392
