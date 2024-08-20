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


