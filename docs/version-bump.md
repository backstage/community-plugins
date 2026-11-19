# Version Bump

## Overview

To keep plugins in the various workspaces up to date with Backstage we have a Version Bump workflow in place, this page documents the process for Plugin Owners and the Community Plugins Maintainers.

> [!NOTE]
> To be able to run this workflow you will need to be an [Organization Member](https://github.com/backstage/community/blob/main/GOVERNANCE.md#organization-member)

## Process

When a Plugin Owner or Community Plugins Maintainer wants to upgrade one or many workspaces to the latest version of Backstage they will simply need to do the following:

1. Navigate to the [Version Bump](https://github.com/backstage/community-plugins/actions/workflows/version-bump.yml) workflow
2. On the right hand side click on the "Run workflow" button
3. In the menu that appears use the following:
   1. For "Use workflow from" use the default "Branch: main"
   2. For "Release Line" use the default "main"
   3. For "Workspace (this much be a JSON array)" you will enter the name(s) of the workspace(s). For example for a single workspace it would look like this: `["azure-devops"]` and for multiple workspaces it would look like this: `["adr", "entity-feedback", "playlist"]`
4. Now click the "Run workflow" button
5. The workflow will then run and create a PR for each workspace provided with the workspaces upgraded to the latest `main` release at the time of it being ran.
6. At this point you can review the created PR(s) like any other PR

### For Community Maintainers

Any workspace that does not have an owner defined in the [`CODEOWNERS`](https://github.com/backstage/community-plugins/blob/main/.github/CODEOWNERS) file is assumed to be owned by the [Community Plugins Maintainers](https://github.com/orgs/backstage/teams/community-plugins-maintainers). The responsibility for version bumping these workspaces will fall to them, though the Community is more than welcome to take on this task.

To simplify this process, you can use the `list-maintainer-workspaces.js` script to get a list of the workspaces owned by this team. It looks at the current workspaces and uses that against the `CODEOWNERS` file and then outputs a total count of workspaces owned by this team and the needed JSON Array of workspaces in chunks of 10 to be used for the Version Bump workflow.

To run the script:

1. Run `yarn install` at the root
2. Then run `node ./scripts/list-maintainer-workspaces.js`
3. You can then copy the arrays as needed

## Reviewing and Merging Version Bump PRs

This section is for Community Plugins Maintainers working through the version bump PRs for the workspaces they own.

### Step 1: Make sure the PRs were generated

The [Auto Version Bump Scheduler](https://github.com/backstage/community-plugins/actions/workflows/auto-version-bump-scheduler.yml) runs every Tuesday at 13:00 UTC. If a Backstage minor release came out in the last 10 days, it triggers the [Auto Version Bump](https://github.com/backstage/community-plugins/actions/workflows/auto-version-bump.yml) workflow, which opens version bump PRs in batches, 5 minutes apart.

If the PRs you expected aren't there:

1. Check the latest [Auto Version Bump Scheduler](https://github.com/backstage/community-plugins/actions/workflows/auto-version-bump-scheduler.yml) run. If it decided not to trigger (for example, the release is more than 10 days old), you can run the [Auto Version Bump](https://github.com/backstage/community-plugins/actions/workflows/auto-version-bump.yml) workflow by hand from `main`.
2. Check the [Version Bump](https://github.com/backstage/community-plugins/actions/workflows/version-bump.yml) runs it started, not just the Auto Version Bump run itself, which only dispatches them and can succeed even when they don't. Version Bump only allows one run at a time, so an earlier batch can get cancelled when a later one starts. A cancelled run may already have finished some workspaces, so once all runs have finished, use "Re-run failed jobs" rather than re-running the whole run, and do them one at a time. Before re-running a job, check that its workspace doesn't already have a version bump branch or PR. Read the logs before re-running a failed one: a workspace that is already on the target version fails on purpose and doesn't need a re-run.
3. If only a few workspaces are missing, run the [Version Bump](https://github.com/backstage/community-plugins/actions/workflows/version-bump.yml) workflow for just those workspaces, as described in the [Process section](#process) above.

### Step 2: Work through the PRs

Use this search: [open maintainer version bump and Version Packages PRs, oldest first](https://github.com/backstage/community-plugins/pulls?q=is%3Aopen+is%3Apr+label%3Aowner%2Farea-maintainers+(in%3Atitle+"version%3Abump"+OR+in%3Atitle+"Version+Packages")+sort%3Acreated-asc)

It uses these filters:

```text
is:open is:pr label:owner/area-maintainers (in:title "version:bump" OR in:title "Version Packages") sort:created-asc
```

Then work down the list from the top:

- **Oldest first.** Sorting by creation date means older Version Packages PRs get merged before the new version bump PRs, so releases don't pile up into a single Version Packages PR.
- **Ten at a time.** Batches of 10 have worked best: big enough to make progress, small enough to keep track of.
- **Approve and merge each PR before moving on.** Approving all 10 first and then merging them is now very slow in GitHub.
- **Then do the Version Packages PRs.** Once the version bump PRs are merged, the matching Version Packages PRs will have been created. Refresh the search and handle them the same way, 10 at a time.

If a PR fails CI or needs migration changes, skip it, carry on with the rest, and come back to it afterwards.
