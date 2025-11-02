# Workflows

This document outlines all GitHub Actions workflows in the `backstage/community-plugins` repository. The custom actions used in these workflows can be found in the [backstage/actions](https://github.com/backstage/actions) repository.

## Workflows Related to Publishing Plugins to NPM

### [release_workspace.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/release_workspace.yml)

Handles the release process for a specific workspace from a specified branch (default: main). It either creates a "Version Packages" pull request if changesets are present or releases the packages within the workspace if they haven't been published yet. For more details on how changesets work, refer to [the Changesets documentation](https://github.com/changesets/changesets).

### [release.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/release.yml)

Responsible for releasing all workspaces in parallel by invoking the release_workspace.yml workflow for each workspace. It runs on the main branch whenever new changes are pushed. The workflow relies on release_workspace.yml to determine if a workspace requires publishing.

### [release_workspace_version.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/release_workspace_version.yml)

This workflow supports patching older release lines. It is useful when backporting changes to previously published versions. For a more detailed explaination on how to use this workflow, see the [Maintaining and patching an older release line section](https://github.com/backstage/community-plugins/blob/main/docs/plugin-maintainers-guide.md#maintaining-and-patching-an-older-release-line) in the [Plugin Maintainer Guide](https://github.com/backstage/community-plugins/blob/main/docs/plugin-maintainers-guide.md).

## Testing & CI

### [ci.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/ci.yml)

Triggered on pull requests, this workflow runs tests on the target branch, focusing only on workspaces that have changes. Once all checks pass successfully, the pull request can be merged.

## Workflows for managing dependency updates

### [renovate.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/renovate.yml)

The `renovate.yml` workflow runs every 60 minutes to update dependencies using the `renovatebot/github-action`. It can also be triggered manually.

### [automate_renovate_changesets.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/automate_renovate_changesets.yml)

Automates the generation of changesets for Renovate pull requests.

## Misc Automation Workflows

### [automate_changeset_feedback.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/automate_changeset_feedback.yml)

This workflow generates feedback for changesets on pull requests, excluding forks and version package PRs. It uses the `backstage/actions/changeset-feedback` action.

### [add-workspace-label.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/add-workspace-label.yml)

Using the `github/issue-labeler` action, this workflow automatically adds labels to issues when they are opened or edited, using rules defined in the labler.yml config file.

### [regenerate_issue_template.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/regenerate_issue_templates.yml)

This workflow updates the issue template’s workspace dropdown to reflect any newly added workspaces. It also updates the labeler rules in [`labeler.yml`](https://github.com/backstage/community-plugins/blob/main/.github/labeler.yml) accordingly and opens a pull request with the changes.

### [automate_staleness.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/automate-staleness.yml)

This workflow marks issues and pull requests as stale after a period of inactivity (60 days). If no further activity occurs, they will be closed after an additional period (7 days). The process is executed regularly (every 6 hours) as a cron job.

### [version-bump.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/version-bump.yml)

Handles version bumping for specific workspaces. It creates a new branch for the version bump, updates the necessary files, commits the changes, and creates a pull request to merge the updates into the main branch.

### [auto-version-bump.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/auto-version-bump.yml)

This workflow enables plugin owners to opt in to automatic version bump pull requests. To do this, they must add `"autoVersionBump": true` to their `bcp.json` file in the root of their workspace (e.g., `workspaces/your-plugin/bcp.json`). The workflow is triggered manually by a maintainer.

### [cron.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/cron.yml)

This workflow periodically runs the `backstage/actions/cron@v0.6.10` action.

### [pr.yml](https://github.com/backstage/community-plugins/blob/main/.github/workflows/pr.yml)

This workflow ensures that pull requests from this repository remain in sync with the [Backstage Project Board](https://github.com/backstage/backstage/).
