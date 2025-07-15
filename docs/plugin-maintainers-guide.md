# Plugin Maintainer Guide

## Table of Contents

- [Plugin Maintainer Guide](#plugin-maintainer-guide)
  - [Table of Contents](#table-of-contents)
  - [Plugin Owner Expectations](#plugin-owner-expectations)
    - [PR Reviews \& Merging](#pr-reviews--merging)
    - [Issue Triage](#issue-triage)
    - [Stepping Down as a Plugin Owner](#stepping-down-as-a-plugin-owner)
  - [Version Bumping](#version-bumping)
  - [Opt-in to Automatic Version Bump PRs](#opt-in-to-automatic-version-bump-prs)
  - [Opt-in to Knip Reports Check](#opt-in-to-knip-reports-check)
  - [Maintaining and patching an older release line](#maintaining-and-patching-an-older-release-line)
    - [Patching an older release](#patching-an-older-release)

## Plugin Owner Expectations

Plugin ownership is codified by the [CODEOWNERS](https://github.com/backstage/community-plugins/blob/main/.github/CODEOWNERS) file.

Plugin ownership is a responsibility often taken on voluntarily and/or in addition to primary job roles. While there are expectations outlined here, this is **not a support commitment**. Timely responses are appreciated, but replies may not be immediate and will depend on availability.

### PR Reviews & Merging

Plugin owners are assumed to have full autonomy over reviewing and merging PRs for their workspace. This includes the merging of Version Packages PRs to trigger a new release.

It is also helpful for workspace owners to review and add approvals to PRs that touch multiple workspaces (such as dependency updates), as these may be landed by `@backstage/community-plugin-maintainers`.

### Issue Triage

Plugin owners should triage issues related to their plugin as needed. The `@backstage/community-plugin-maintainers` group may tag the listed owners on relevant issues. Issues are labeled as `workspace/<workspace_name>` based on their related workspace automatically by a workflow. Plugin maintainers can use these labels to easily filter and track issues relevant to their plugins.

### Stepping Down as a Plugin Owner

It's okay to step down as a plugin owner — priorities, roles, and availability naturally change over time. It’s better to reflect current reality than to appear active when you’re not available. If you remain listed as a CODEOWNER, GitHub will continue to assign you to issues and reviews, which can lead to confusion or delays for contributors.

If you are no longer maintaining a plugin, please take the following steps to formally step down:

1. Remove yourself from the CODEOWNERS file:

   - Edit the [CODEOWNERS](https://github.com/backstage/community-plugins/blob/main/.github/CODEOWNERS) file to remove your GitHub handle from the plugin or workspace you no longer maintain.
   - Open a pull request with a description stating that you are stepping down as a maintainer.

2. Leave any associated GitHub teams:

   - If you were added to any GitHub teams specifically for plugin ownership or maintenance, please leave those teams.

3. If you are the last remaining CODEOWNER:
   - The `@backstage/community-plugins-maintainers` group will provide best-effort support for issues and maintenance. Without a dedicated owner, plugin updates and support may be slower or limited.
   - To help with this, opt into automatic version bump PRs by creating an empty `.auto-version-bump` file in the plugin’s workspace (i.e., `workspaces/${WORKSPACE}/.auto-version-bump`).

## Version Bumping

Plugin owners are expected to run the Version Bump script for their workspace. The process follows the guidance outlined in the [Version Bumping Documentation](https://github.com/backstage/community-plugins/blob/main/docs/version-bump.md).

## Opt-in to Automatic Version Bump PRs

Plugin owners can opt in to automatic version bump PRs by creating an empty .auto-version-bump file in the root of their workspace (`workspaces/${WORKSPACE}/.auto-version-bump`). This signals that your plugin should be included in the batch version bump workflow, which is triggered manually by one of the `@backstage/community-plugins-maintainers` .

These automated PRs are intended as a convenience to open the version bump for you. As the plugin maintainer, you would still be required to:

- Review the PR
- Make any necessary patches to adopt the upgrade
- Merge the PR once it's ready

## Opt-in to Knip Reports Check

Plugin owners can opt in to Knip reports check in CI by creating a `bcp.json` file in the root of their workspace (`workspaces/${WORKSPACE}/bcp.json`) with the content `{ "knip-reports": true }`. This ensures that knip reports in your workspace stay up to date.

[Knip](https://knip.dev/) is a tool that helps with clean-up and maintenance by identifying unused dependencies within workspaces. Regularly reviewing and addressing these reports can significantly improve code quality and reduce bloat.

## Maintaining and patching an older release line

It may be necessary to patch a prior release line of a plugin when users depend on an older, but stable version and while a newer, incompatible, major version of the plugin exists. Typically for these older releases, only major bugs and security issues will need to be remediated. Not every plugin will need this workflow.

This guide will describe the steps needed to release on an older version.

### Patching an older release

When patching an older release, follow the steps below to ensure the correct workflow is applied:

1. Request a `workspace/${workspace}` branch by asking one of the [@backstage/community-plugins-maintainers](https://github.com/orgs/backstage/teams/community-plugins-maintainers).

   - Ensure that a branch named `workspace/${workspace}` exists, with appropriate branch protections in place. This branch will be used for patch releases.
   - The `${workspace}` should correspond to the specific plugin or component you are patching.

   <details>
   <summary>Community Plugins Maintainers - Branch Protection Settings</summary>

   In **GitHub > Repo > Settings > Branches**, add a rule for the requested `workspace/${workspace}` branch and apply these settings:

   - ☑ Require pull request before merging
     - ☑ Require approvals
     - ☑ Dismiss stale approvals when new commits are pushed
     - ☑ Require review from Code Owners
   - ☑ Require status checks to pass before merging
   - ☑ Restrict who can push: **CODEOWNERS for the workspace**
   - ☑ Restrict pushes that create matching branches
   - ☑ Allow force pushes
     - ☑ Specify who can force push: **CODEOWNERS for the workspace**

   </details>

2. Reset the `workspace` branch:

   - Reset the `workspace/${workspace}` branch to the version of the plugin you need to patch.
   - You can use the autogenerated version tags from previous releases to pinpoint the prior release version to apply the patch.

3. Apply your commits and push to a branch:

   - Apply the necessary patch fixes or security updates.
   - Do not manually bump the version in `package.json`. The version bump must be handled via changesets.
   - Push to a branch on the `backstage/community-plugins` repository. Note that it is not possible to open PRs from a fork for this release workflow.

4. Submit a PR following the required workflow:

   - Open a pull request with your changes against the `workspace/${workspace}` branch.
   - Ensure the PR:
     - Contains only necessary fixes.
     - Includes a changeset.

5. Merge the PR to trigger the release workflow:

   - The PR must meet these conditions to be merged:
     - The PR title starts with "Version Packages" (automatically generated by changesets).
     - The PR originates from a `maintenance-changesets-release/${workspace}` branch.
     - The PR is authored by `backstage-service`.
     - The PR is merged, not just closed.
   - Once merged, the release workflow will automatically trigger, building and publishing the new release.

6. Confirm the release:

   - Once the workflow completes, a new version will be published.
   - A new Git tag will be created, which can be used for future patches.
   - The release will be tagged as "maintenance" in the package registry to avoid overwriting latest stable versions.

7. Open a PR with the `CHANGELOG` additions to `backstage/community-plugins` main branch:
   - This is necessary for history to be clear on the latest branch.
   - You can use `git cherry-pick --no-commit workspace/${workspace}` and only commit the `CHANGELOG` files.
