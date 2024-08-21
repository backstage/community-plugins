# CI/CD Workflows

## [ci.yml](./ci.yml)

Triggered on pull requests, this workflow runs tests on the target branch, focusing only on workspaces that have changes. Once all checks pass successfully, the pull request can be merged.

## [release_workspace.yml](./release_workspace.yml)

Handles the release process for a specific workspace. It either creates a "Version Packages" pull request if changesets are present or releases the packages within the workspace if they haven't been published yet. For more details on how changesets work, refer to the [Changesets documentation](https://github.com/changesets/changesets).

## [release-all.yml](./release-all.yml)

Responsible for releasing all workspaces in parallel by invoking the `release_workspace.yml` workflow for each workspace. It runs on the main branch whenever new changes are pushed. The workflow relies on `release_workspace.yml` to determine if a workspace requires publishing.

## [automate_changeset_feedback.yml](./automate_changeset_feedback.yml)

Generates feedback for changesets on pull requests.

## [automate_renovate_changeset.yml](./automate_renovate_changeset.yml)

Automates the generation of changesets for Renovate pull requests.

## [cron.yml](./cron.yml)

Runs tasks on a scheduled basis or manually via the `workflow_dispatch` event.

## [pr.yml](./pr.yml)

## [renovate_cron.yml](./renovate_cron.yml)

Runs Renovate on a scheduled basis or manually.

## [version_bump.yml](./version_bump.yml)

Handles version bumping for specific workspaces. It creates a new branch for the version bump, updates the necessary files, commits the changes, and creates a pull request to merge the updates into the main branch.
