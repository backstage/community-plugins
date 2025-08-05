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

### Generate List of All Workspaces

> [!WARNING]
> Do not use the entire list as you will hit rate limits, chunks of 5-10 work best

If you want to run the Version Bump workflow against all the workspaces in this repo you can do the following to generate the proper JSON array:

1. Navigate into the `/workspaces` folder
2. Run: `ls | jq -R '[.]' | jq -s -c 'add'`
3. Copy the output and use it as the Workspace value for Step 3 in the [Process section](#process) above
