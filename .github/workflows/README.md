# CI/CD Workflows

## [ci.yml](./ci.yml)

Triggered on pull requests, this workflow runs tests on the target branch, focusing only on workspaces that have changes. Once all checks pass successfully, the pull request can be merged.

## [create_changeset_pr_for_workspace.yml](./create_changeset_pr_for_workspace.yml)

Creates a "Version Packages" pull request for a specific workspace. For more details on how changesets work, refer to the [Changesets documentation](https://github.com/changesets/changesets).

## [release_workspace.yml](./release_workspace.yml)

Handles the release process for a specific workspace.

## [release_all.yml](./release_all.yml)

Responsible for releasing all workspaces in parallel by invoking the `release_workspace.yml` workflow for each workspace that needs to be released, and by invoking `create_changeset_pr_for_workspace.yml` workflow for each workspace that has new changesets. It runs on the main branch whenever new changes are pushed.

## [automate_changeset_feedback.yml](./automate_changeset_feedback.yml)

Generates feedback for changesets on pull requests.

## [automate_renovate_changesets.yml](./automate_renovate_changesets.yml)

Automates the generation of changesets for Renovate pull requests.

## [cron.yml](./cron.yml)

Runs tasks on a scheduled basis or manually via the `workflow_dispatch` event.

## [pr.yml](./pr.yml)

Used to keep the Project Board in https://github.com/backstage/backstage/ in sync with PRs from this repo.

## [renovate.yml](./renovate.yml)

Runs Renovate on a scheduled basis or manually.

## [version-bump.yml](./version-bump.yml)

Handles version bumping for specific workspaces. It creates a new branch for the version bump, updates the necessary files, commits the changes, and creates a pull request to merge the updates into the main branch. See [version-bump.md](../../docs/version-bump.md) for configuration details.

## [automate-staleness.yml](./automate-staleness.yml)

This workflow marks issues and pull requests (PRs) as stale after a period of inactivity. If no further activity occurs, they will be closed after an additional period. The process is executed regularly as a cron job.
