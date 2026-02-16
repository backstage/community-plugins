# Plugin Maintainer Guide

## Table of Contents

- [Plugin Maintainer Guide](#plugin-maintainer-guide)
  - [Table of Contents](#table-of-contents)
  - [Plugin Owner Expectations](#plugin-owner-expectations)
    - [PR Reviews \& Merging](#pr-reviews--merging)
    - [Issue Triage](#issue-triage)
    - [Stepping Down as a Plugin Owner](#stepping-down-as-a-plugin-owner)
  - [Archiving a Plugin](#archiving-a-plugin)
    - [When to Archive](#when-to-archive)
    - [How to Archive](#how-to-archive)
  - [Version Bumping](#version-bumping)
  - [Opt-in to Automatic Version Bump PRs](#opt-in-to-automatic-version-bump-prs)
  - [Opt-in to Knip Reports Check](#opt-in-to-knip-reports-check)
  - [Opt-in to List Deprecations Check](#opt-in-to-list-deprecations-check)
  - [Opt-in to Playwright UI Check](#opt-in-to-playwright-ui-check)
  - [Maintaining and patching an older release line](#maintaining-and-patching-an-older-release-line)
    - [Patching an older release](#patching-an-older-release)
  - [FAQ](#faq)
    - [The bot says I'm missing a changeset. How do I add one?](#the-bot-says-im-missing-a-changeset-how-do-i-add-one)
    - [My PR is full of unrelated files ("Knip" changes, `yarn.lock` conflicts)!](#my-pr-is-full-of-unrelated-files-knip-changes-yarnlock-conflicts)
    - [A GitHub check is stuck "waiting for status to be reported".](#a-github-check-is-stuck-waiting-for-status-to-be-reported)
    - [The "API Report" check is failing.](#the-api-report-check-is-failing)
    - [My build is failing with errors about `package.json` metadata.](#my-build-is-failing-with-errors-about-packagejson-metadata)
    - [My CI workflow is failing with some Node.js versions.](#my-ci-workflow-is-failing-with-some-nodejs-versions)
    - [My CI workflow is failing due to linting errors.](#my-ci-workflow-is-failing-due-to-linting-errors)
    - [How do I create a new plugin?](#how-do-i-create-a-new-plugin)

## Plugin Owner Expectations

Plugin ownership is codified by the [CODEOWNERS](https://github.com/backstage/community-plugins/blob/main/.github/CODEOWNERS) file.

Plugin ownership is a responsibility often taken on voluntarily and/or in addition to primary job roles. While there are expectations outlined here, this is **not a support commitment**. Timely responses are appreciated, but replies may not be immediate and will depend on availability.

> [!IMPORTANT]
> It is an explicit expectation that Plugin owners will [version bump](https://backstage.io/docs/getting-started/keeping-backstage-updated#updating-backstage-versions-with-backstage-cli) their plugins on a Monthly basis to keep them in line with Backstage versions. There is automation for [generating the version bump PR](#version-bumping) and the [optional ability to have the version bump PR automatically created](#opt-in-to-automatic-version-bump-prs) for you each month. We expect that this will mean you have roughly an hour or two commitment each month for this task. The Community Plugin Maintainers are happy to help with any issues you have with this process!

### PR Reviews & Merging

Plugin owners are assumed to have full autonomy over reviewing and merging PRs for their workspace. This includes the merging of Version Packages PRs to trigger a new release.

It is also helpful for workspace owners to review and add approvals to PRs that touch multiple workspaces, as these may be landed by `@backstage/community-plugin-maintainers`.

In the case of PRs for dependency updates, if these are not handled and become stale, `@backstage/community-plugin-maintainers` will take action to merge or close them.

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
   - To help with this, opt into automatic version bump PRs by adding `"autoVersionBump": true` to your `bcp.json` file in the plugin's workspace (i.e., `workspaces/${WORKSPACE}/bcp.json`).

## Archiving a Plugin

When a plugin is no longer maintained, it should be archived rather than abandoned. The archival process ensures that users are properly notified through npm deprecation warnings while preserving the code for historical reference through Git tags.

### When to Archive

Consider archiving a plugin when:

- The plugin is no longer actively maintained
- No current maintainer is available (and no one is stepping up)
- The plugin has unresolved security vulnerabilities that won't be fixed
- The plugin functionality has been superseded by better alternatives
- The plugin is incompatible with current Backstage versions and won't be updated

### How to Archive

Follow these steps to archive a plugin or workspace:

1. Run the archive script to designate the plugin(s) as archived:

   ```bash
   # Archive an entire workspace (defaults to "No longer maintained")
   node scripts/archive.js workspace-name

   # Archive an entire workspace with custom reason
   node scripts/archive.js workspace-name "Custom reason"

   # Archive a specific plugin within a workspace (use package name after @backstage-community/)
   node scripts/archive.js workspace-name plugin-name "Custom reason"
   ```

   This will:

   - Record Git tag references using `package.json` versions (`@backstage-community/plugin-example@1.2.3`)
   - Add entries to `.github/archived-plugins.json` and `ARCHIVED_WORKSPACES.md`
   - Remove entries from `docs/README.md`
   - If archiving an entire workspace, remove entries from `.github/ISSUE_TEMPLATE/1-bug.yaml`, `.github/ISSUE_TEMPLATE/2-feature.yaml`, `.github/ISSUE_TEMPLATE/snippets/workspaces-dropdown.yaml`, `.github/labeler.yml`, `.github/CODEOWNERS`, and `docs/compatibility/compatibility.md`

2. Dry run the following script to verify which packages would be deprecated:

   ```bash
   ./scripts/ci/deprecate-archived-plugins.sh --dry-run
   ```

3. Delete the workspace or plugin(s) from the repository. Ensure that any relevant documentation has been appropriately updated to reflect the removal of the workspace/plugin.

4. Open a PR with the changes including:

   - Updated `.github/archived-plugins.json`
   - Updated `ARCHIVED_WORKSPACES.md`
   - Removed workspace/plugin

5. Once the PR is merged, the GitHub Action will automatically deprecate the packages in `.github/archived-plugins.json` on npm. Note the `.github/archived-plugins.json` requires codeowner approval from `@backstage/community-plugins-maintainers`.

## Version Bumping

Plugin owners are expected to run the Version Bump script for their workspace. The process follows the guidance outlined in the [Version Bumping Documentation](https://github.com/backstage/community-plugins/blob/main/docs/version-bump.md).

## Opt-in to Automatic Version Bump PRs

Plugin owners can opt in to automatic version bump PRs by adding `"autoVersionBump": true` to their `bcp.json` file in the root of their workspace (`workspaces/${WORKSPACE}/bcp.json`). This signals that your plugin should be included in the batch version bump workflow, which is triggered manually by one of the `@backstage/community-plugins-maintainers`.

These automated PRs are intended as a convenience to open the version bump for you. As the plugin maintainer, you would still be required to:

- Review the PR
- Make any necessary patches to adopt the upgrade
- Merge the PR once it's ready

## Opt-in to Knip Reports Check

Plugin owners can opt in to Knip reports check in CI by creating a `bcp.json` file in the root of their workspace (`workspaces/${WORKSPACE}/bcp.json`) with the content `{ "knipReports": true }`. This ensures that knip reports in your workspace stay up to date.

[Knip](https://knip.dev/) is a tool that helps with clean-up and maintenance by identifying unused dependencies within workspaces. Regularly reviewing and addressing these reports can significantly improve code quality and reduce bloat.

## Opt-in to List Deprecations Check

Plugins owners can opt into the List Deprecations check in CI by creating a `bcp.json` file in the root of their workspace (`workspaces/${WORKSPACE}/bcp.json`) with the content `{ "listDeprecations": true }`. This ensures that you aren't using deprecated code in your workspace making it easier when deprecated code is finally removed.

## Opt-in to Playwright UI Check

Plugin owners can opt into running any Playwright-based tests from their workspace by creating a `bcp.json` file in the root of their workspace (`workspaces/${WORKSPACE}/bcp.json`) with the content `{ "playwrightTests": true }`. This is intended for quick fontend tests using the plugin's dev pages. The following commands will be run in the root of the workspace as part of the CI workflow:

```shell
yarn playwright install --with-deps chromium chrome
yarn playwright test
```

There are several requirements for this check to run green:

- The workspace has a dependency on `@playwright/test` package
- The root of the workspace contains a playwright configuration file
- Currently supported browsers are Chromium and Chrome
- Launching the plugin needs to be part of the test configuration

Test file selection is based solely on the config file. Launching the plugin can be done using the `webServer` option in the config file as well. For more details about configuration, see the [documentation](https://playwright.dev/docs/test-configuration).

Note that since there is no per-plugin configuration for the workflow, there is no place to store secrets for the CI, in case any communication with external services is required. For the sake of consistency, we recommend testing using static data for the dev pages, or [mocking](https://playwright.dev/docs/mock#mock-api-requests) any external APIs during as part of the tests themselves.

For a working example, check out the [quay](/workspaces/quay/) workspace. In particular, the [config](/workspaces/quay/playwright.config.ts) file, and the [tests](/workspaces/quay/plugins/quay/tests/) might be of interest.

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

   - ☑ Restrict who can push: **CODEOWNERS for the workspace**
   - ☑ Restrict pushes that create matching branches
   - ☑ Allow force pushes
     - ☑ Specify who can force push: **CODEOWNERS for the workspace**

   The workflow requires that pull requests targeting the `workspace/${workspace}` branch be opened from a branch within the `backstage/community-plugins` repository. Therefore, in addition to the `workspace/${workspace}` branch, a corresponding branch must also be created with the same branch protection settings described above.

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

---

## FAQ

Here are some common issues and questions that contributors often face.

### The bot says I'm missing a changeset. How do I add one?

If your change affects any code inside a `plugins/` or `packages/` directory, it needs a changeset file to document the change for the release. Please follow the [Backstage contributing guide on creating changesets](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#creating-changesets).

### My PR is full of unrelated files ("Knip" changes, `yarn.lock` conflicts)\!

This happens when your branch is out-of-date with the main `main` branch. You need to rebase your branch to include the latest changes _before_ your commits.

1.  Make sure your local `main` branch is up-to-date:
    ```bash
    git checkout main
    git pull origin main
    ```
2.  Switch back to your feature branch:
    ```bash
    git checkout my-feature-branch
    ```
3.  Rebase your branch on top of `main`:
    ```bash
    git rebase main
    ```
4.  Fix any merge conflicts that come up.
5.  Force-push your rebased branch. This will update your PR with a clean history:
    ```bash
    git push --force-with-lease
    ```

### A GitHub check is stuck "waiting for status to be reported".

The easiest way to fix it is to close your Pull Request and then immediately reopen it. This forces GitHub to re-trigger the checks.

### The "API Report" check is failing.

This means you changed an exported type, function, or class, and the API documentation needs to be updated.

1.  Run `yarn backstage-cli api-report:ci` from the root of the repo.
2.  This will automatically update the `api-report.md` file for your plugin.
3.  Commit this updated file to your PR.

### My build is failing with errors about `package.json` metadata.

The `package.json` for your plugin might be missing required fields or have incorrect values.

1.  Go to your plugin's workspace directory (e.g., `workspaces/my-plugin/`).
2.  Run `yarn backstage-cli repo fix --publish`
3.  This will check for and automatically fix common `package.json` issues. Commit any changes.

### My CI workflow is failing with some Node.js versions.

The CI workflow runs your tests automatically with all versions configured in your workspace root `package.json`, configured under `engines.node`, like:

```json
  "engines": {
    "node": "22 || 24"
  },
```

This versions should match the [Node.js versions supported by Backstage](https://backstage.io/docs/overview/versioning-policy/#nodejs-releases).

### My CI workflow is failing due to linting errors.

This means your code doesn't match the project's automatic formatting rules.

1.  Run `yarn lint --fix` from the root of the repo. This will automatically fix most linting errors.
2.  Commit the changes that the linter made to your files.

### How do I create a new plugin?

1.  From the root of the `community-plugins` repository, run the new plugin creation script:
    ```bash
    yarn new
    ```
2.  Follow the interactive prompts. It will ask you for the plugin name, what kind of plugin it is (frontend, backend, etc.), and will create all the boilerplate files for you in a new folder under `workspaces/`.
3.  Commit all the newly created files and open a PR.
