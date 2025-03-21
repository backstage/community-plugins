# Contributing to `backstage/community-plugins`

The `backstage/community-plugins` repository is designed as a collaborative space for Backstage community members to host and manage their plugins for Backstage. This repository will provide plugin maintainers with tools for plugin management and publication. By contributing a plugin to this repository, maintainers agree to adhere to specific guidelines and a standardized release process detailed in this guide.

If you have questions or feedback regarding Community Plugins, you can visit the [Community Plugins #general channel](https://discord.com/channels/687207715902193673/1211692810294788126) in the Backstage [Discord](https://discord.gg/backstage-687207715902193673).

## Table of Contents

- [Contributing to `backstage/community-plugins`](#contributing-to-backstagecommunity-plugins)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)
  - [Security Issues](#security-issues)
  - [Get Started](#get-started)
    - [Forking the Repository](#forking-the-repository)
    - [Developing Plugins in Workspaces](#developing-plugins-in-workspaces)
  - [Coding Guidelines](#coding-guidelines)
  - [Versioning](#versioning)
  - [Creating Changesets](#creating-changesets)
  - [Release](#release)
  - [Creating a new Workspace](#creating-a-new-workspace)
  - [Creating new plugins or packages in a Workspace](#creating-new-plugins-or-packages-in-a-workspace)
  - [Migrating a plugin](#migrating-a-plugin)
    - [Manual migration steps](#manual-migration-steps)
  - [Organization Membership Request for CODEOWNERS](#organization-membership-request-for-codeowners)
  - [Developer Certificate of Origin](#developer-certificate-of-origin)
  - [API Reports](#api-reports)
  - [Submitting a Pull Request](#submitting-a-pull-request)
    - [Merge Strategy](#merge-strategy)
  - [Review Process](#review-process)
    - [Review Tips](#review-tips)

## Code of Conduct

By contributing to Backstage Community Plugins you agree to adhere to the [CNCF Code of Conduct][code-of-conduct].

[code-of-conduct]: https://github.com/cncf/foundation/blob/main/code-of-conduct.md

## License

The community plugins repository is under [Apache 2.0](../LICENSE) license. All plugins added & moved to the repository will be kept under the same license. If you are moving a plugin over make sure that no other license file is in the plugin workspace & all `package.json` files either have no version defined or explicitly use _“Apache 2.0”_.

## Security Issues

See [SECURITY](SECURITY.md).

## Get Started

So...feel ready to jump in? Let's do this. 👏🏻 💯

### Forking the Repository

Ok. So you're gonna want some code right? Go ahead and fork the repository into your own GitHub account and clone that code to your local machine. GitHub's [Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo) documentation has a great step by step guide if you are not sure how to do this.

If you cloned a fork, you can add the upstream dependency like so:

```bash
git remote add upstream git@github.com:backstage/community-plugins.git
git pull upstream main
```

After you have cloned the Community Plugins repository, you should run the following commands once to set things up for development:

```bash
# jump in to the community-plugins repo that you cloned
cd community-plugins
# install the root dependencies so that you can create workspaces if needed
yarn install
# navigate to a workspace that you're working on
cd workspaces/linguist
# install the workspace dependencies
yarn install
```

### Developing Plugins in Workspaces

Frontend and Backend plugins come with a standalone runner that you should be able to utilize in order to develop on your plugins in isolation. You can navigate to a workspace and a plugin inside the plugin folder and run `yarn start` which should kick off the development standalone server for that plugin. It's also possible that this might not be setup for plugins that were migrated from the `backstage/backstage` repository, in which case you can set them up following some prior art in the `backstage/backstage` repository. [backend plugin dev](https://github.com/backstage/backstage/blob/e46d3fe011fe19821b2556f0164442cc0b825363/plugins/auth-backend/dev/index.ts) and [frontend plugin dev](https://github.com/backstage/backstage/blob/e46d3fe011fe19821b2556f0164442cc0b825363/plugins/home/dev/index.tsx) examples.

There could be times when there is a need for a more rich development environment for a workspace. Say that the workspace and it's plugin depend on a full catalog, and maybe the kubernetes plugin already running too, that could be a bit of a pain to set up. In that case, there might be a full Backstage environment that you can run with `yarn dev` in the workspace root, which will start up a full Backstage environment located in `$WORKSPACE_ROOT/packages/app` and `$WORKSPACE_ROOT/packages/backend`.

> [!IMPORTANT]
> This full Backstage environment is not setup by default, and is setup on a per workspace basis. Check out the workspace `README.md` for more information on how to get a dev environment setup for each plugin.

## Coding Guidelines

To keep the codebase consistent and maintainable, we have a some cross workspace tolling in place:

- `yarn`: is the package manager used for all workspaces. We will regularly update the yarn version to keep up with the latest features and bug fixes. This version is managed in the root `package.json` and `.yarnrc.yml` files and should not be locked to a different version in any workspace. Updating the yarn version could imply changes on all the `yarn.lock` files.
- `prettier`: All code is formatted with `prettier` using the configuration in the repo. If possible we recommend configuring your editor to format automatically, but you can also use the `yarn prettier --write <file>` command to format files.

## Versioning

For the versioning all packages in this repository are following the semantic versioning standard enforced through Changesets. This is the same approach as in the main “backstage/backstage” repository. If this is your first time working with Changesets checkout [this documentation](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#creating-changesets) or read a quick summary below.

## Creating Changesets

We use [changesets](https://github.com/atlassian/changesets) to help us prepare releases. They help us make sure that every package affected by a change gets a proper version number and an entry in its `CHANGELOG.md`. To make the process of generating releases easy, it helps when contributors include changesets with their pull requests.

To create a changeset, follow these steps:

1. Make sure you are in the root directory of the workspace for the plugin you want to create a changeset for. For ex: if you are making changes on the `adr` plugin then you should be on `workspaces/adr` dir

2. Run the following command to create a new changeset:

   ```bash
   $ yarn changeset
   ```

3. You will be prompted to select the packages and the type of change you are making.

4. Enter a short description of the change when prompted. Refer to [backstage/backstage CONTRIBUTING.md#writing-changesets](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#writing-changesets) for additional guidance on writing changesets.

5. Review the changeset file that was created. It should be located in the `.changeset` directory of your plugin's workspace.

6. Commit the changeset file to your branch/PR.

Once the changeset is merged, it will trigger the release process for the plugin and create a "Version packages ($workspace_name)" PR. Once the PR is merged, a new version of the plugin will be published based on the type of change made.

> [!NOTE]
> It's important to create a changeset for each individual change you make to a plugin. This ensures that the release process is properly managed and that dependencies between plugins are correctly updated.

## Release

As soon as a plugin is part of the community plugins repository every PR with a change is expected to contain a changeset. As soon as the PR is merged a follow up PR will be created called _“Version Packages (your-plugin-name)”_. This version packages PR will remove the merged changeset & add it to the changelog for the specific plugin. Additionally the version in the `package.json` is adjusted.

A release is automatically triggered by merging the plugins “Version Packages” PR.

## Creating a new Workspace

For workspaces the name should reflect the name of the plugins contained in a simple manner (e.g. for the plugins `todo` & `todo-backend` the workspace would be called `todo`).

For plugins we will continue to follow the naming pattern suggested by the ADR on the main repository: <https://backstage.io/docs/architecture-decisions/adrs-adr011>.

You can create a workspace by running the following:

```bash
# jump in to the community-plugins repo that you cloned
cd community-plugins
# install the root dependencies so that you can create workspaces
yarn install
# create a workspace and follow the prompt
yarn create-workspace
```

From there, once the script has finished, you should have a new `yarn workspace` with it's own changesets and releases. You can navigate to the workspace and start developing your plugin.

## Creating new plugins or packages in a Workspace

Once you have a workspace setup, the creation of new plugins and packages is just like any other Backstage repository. You can use the `yarn new` command to run the prompt for creating new plugins or packages.

```bash
cd workspaces/adr
yarn new
```

### Local development of plugins

We recommend setting up a local development environment for your plugin. New plugins come with a `dev/index.ts` file that can be used to run the plugin in a standalone environment. This is useful for developing the plugin in isolation, please make sure that the `dev/index.ts` file is set up correctly for your plugin. For example, this is how it has been setup in the linguist workspace [frontend dev environment](https://github.com/backstage/community-plugins/blob/main/workspaces/linguist/plugins/linguist/dev/index.tsx) and [backend dev environment](https://github.com/backstage/community-plugins/blob/main/workspaces/linguist/plugins/linguist-backend/dev/index.tsx).

If your project is composed by multiple plugins you can run them all together by setting up a `yarn dev` command in the workspace root.

For example, if your workspace contains a frontend plugin `@backstage-community/plugin-foo` that uses the entity page and a backend plugin `@backstage-community/plugin-foo-backend` you can add the following to the `package.json`:

```diff
  "scripts": {
+   "dev": "yarn workspaces foreach -A --include @backstage-community/plugin-foo --include @backstage-community/plugin-foo-backend --parallel -v -i run start",
    "start": "yarn workspace app start",
```

## Migrating a plugin

Before proceeding with migrating a plugin, please review the following sections of the `README`:

- [What is the community plugins repository](https://github.com/backstage/community-plugins?tab=readme-ov-file#what-is-the-community-plugins-repository)
- [Community Plugins Workflow](https://github.com/backstage/community-plugins#community-plugins-workflow)

By migrating a plugin to this repository you will need to ensure you can meet certain requirements and adhere to some specific guidelines:

- Agree to publish the plugin to the `@backstage-community` npm scope.
- Adopt the Changesets workflow for releasing new plugin versions.
- Adhere to the repository security process for handling security-related issues.
- Agree to commit to the responsibilities and requirements listed in the [Plugin Maintainer's role
  ](https://github.com/backstage/community/blob/main/GOVERNANCE.md#plugin-maintainer).
- Plugins moved to the repository should be licensed under Apache 2.0.

### Manual migration steps

1. Prepare your environment by cloning both the repository you are migrating from and the `backstage/community-plugins` repository:

```sh
git clone https://github.com/source-repo/existing-plugins.git
git clone https://github.com/backstage/community-plugins.git
```

2. Identify the plugin(s) you wish to migrate. If you're migrating multiple plugins, it's recommended to group the migration of these by workspace.

3. Within the `backstage/community-plugins` repository create a new branch for your changes:

```sh
git checkout -b migrate-workspace
```

4. Create a new workspace in the community plugins repository. See the [Creating a new Workspace](#creating-a-new-workspace) section for more information.

5. Copy the plugin files from the source repository to the `backstage/community-plugins` repository.

```sh
cp -r ../existing-plugins/plugins/plugin-name plugins/
```

6. Ensure all metadata files (`package.json`) are updated to reflect the new repository. This includes updating repository URLs, issues URLs, and other references.

7. Generate API reports for the new plugin(s) in the workspace. See the [API Reports](#api-reports) section for more information.

8. If migrating older plugins, the `package.json` file may not contain the required Backstage metadata. This can usually be resolved by running the command below.

```sh
# navigate to the root of the workspace
yarn backstage-cli repo fix --publish
```

Visit the [Package Metadata documentation](https://backstage.io/docs/tooling/package-metadata/#backstagepluginpackages) for more information.

9. Add maintainers to the `CODEOWNERS` file for the new workspace.

> **Note:** The `CODEOWNERS` file will have errors until the [Organization Membership Request for CODEOWNERS](#organization-membership-request-for-codeowners) has been approved. However, it is still useful to add `CODEOWNERS` as this point as it provides a documented reference as to who owns/maintains the plugin.

10. Create a new pull request from your branch.

11. Update external references to the old plugin location such as documentation to point to the new location in the `backstage/community-plugins` repository. If applicable, update the [Backstage Plugin directory](https://backstage.io/plugins/) to reflect the new location ([example](https://github.com/backstage/backstage/pull/28502)).

12. In the original repository, update the plugin to indicate that it has been moved to the `backstage/community-plugins` repository. It's recommended you deprecate the old plugin packages on npm.

## Organization Membership Request for CODEOWNERS

This section outlines the process for plugin maintainers to request organization membership in the Backstage community, which is necessary for efficiently managing `CODEOWNERS` in this repository.

Plugin maintainers can request organization membership by submitting a request through [this link](https://github.com/backstage/community/issues/new/choose) and filling out the provided form. In the request, they should:

- List the plugins they have contributed and/or maintain within the 'Highlighted Contributions' section.
- Ping the [Community Plugins Area Maintainers](https://github.com/backstage/community/tree/main/project-areas/community-plugins#community-plugin-area-maintainers) for review and support of the request.

As becoming an organization member provides elevated permissions, addition of new organization members follows a vetting process, while hoping not to create unnecessary barriers for new plugin maintainers. The following criteria are often used for the vetting process:

- Is the individual a member of other teams in Backstage?
- What is the length and consistency of their involvement with Backstage plugins and/or the Backstage community?
- Are there other contributors or plugin maintainers who work with the individual and can vouch for them?
- Do they have an employer with a vested interest in the Backstage community?

The Community Plugins Area Maintainers will review the request. While the request is being processed, plugin maintainers are encouraged to review and approve PRs related to their plugins, even though it will not yet show up as a formal review in the GitHub UI.

**Form Details:**

- **Name**: Organization Membership Request
- **Description**: A request to become a Backstage organization member
- **Title**: Org Member: `<your-github-login>`
- **Labels**: `org-member-request`

The form includes fields to confirm adherence to the Code of Conduct, list highlighted contributions, and more. Please ensure you provide:

1. The plugins you maintain within the community plugins section.
2. Links to your notable contributions (PRs, issues, etc.).
3. A list of other plugin maintainers who can vouch for your request.

Once the form is submitted, the plugin maintainers will review your request and provide feedback or support as needed.

## Developer Certificate of Origin

Backstage Community Plugins has adopted a [Developers Certificate of Origin (DCO)](https://developercertificate.org/) - refer to the Backstage [CONTRIBUTING.md#developer-certificate-of-origin](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#developer-certificate-of-origin) for more information on the DCO and guidance on signing commits.

## API Reports

Backstage uses [API Extractor](https://api-extractor.com/) and TSDoc comments to generate API Reports in Markdown format. These reports are what drive the [API Reference documentation](https://backstage.io/docs/reference/). What this means is that if you are making changes to the API or adding a new plugin then you will need either generate a new API Report or update an existing API Report. If you don't do this the CI build will fail when you create your Pull Request.

There are two ways you can do this:

1. You can run `yarn build:api-reports` from the root of the project and it will go through all of the existing API Reports and update them or create new ones as needed. This may take a while but is generally the best method if you are new to this.
2. You can run `yarn build:api-reports plugins/<your-plugin-with-changes>` from the workspace root and it will update the existing API Report or create a new one.

> Note: the above commands assume you've run `yarn install` before hand or recently

Each plugin/package has its own API Report which means you might see more then one file updated or created depending on your changes. These changes will then need to be committed as well.

> [!WARNING]
> If you encounter this error during `yarn build:api-reports` or the "check API reports and generate API reference" step in CI:
> "The API Report for _plugin_ is not allowed to have warnings"
>
> Open the API report to view more details about the warning(s), resolve them, and regenerate the api reports with `yarn build:api-reports` before committing the changes.

## Submitting a Pull Request

When you've got your contribution working, tested, and committed to your branch it's time to create a Pull Request (PR). If you are unsure how to do this GitHub's [Creating a pull request from a fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) documentation will help you with that. Once you create your PR you will be presented with a template in the PR's description that looks like this:

```md
## Hey, I just made a Pull Request!

<!-- Please describe what you added, and add a screenshot if possible.
     That makes it easier to understand the change so we can :shipit: faster. -->

#### :heavy_check_mark: Checklist

<!--- Please include the following in your Pull Request when applicable: -->

- [ ] A changeset describing the change and affected packages. ([more info](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#creating-changesets))
- [ ] Added or updated documentation
- [ ] Tests for new functionality and regression tests for bug fixes
- [ ] Screenshots attached (for UI changes)
- [ ] All your commits have a `Signed-off-by` line in the message. ([more info](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#developer-certificate-of-origin))
```

From here all you need to do is fill in the information as requested by the template. Please do not remove this as it helps both you and the reviewers confirm that the various tasks have been completed.

Here are some examples of good PR descriptions:

- <https://github.com/backstage/backstage/pull/19473>
- <https://github.com/backstage/backstage/pull/19623>
- <https://github.com/backstage/backstage/pull/15881>
- <https://github.com/backstage/backstage/pull/16401>

### Merge Strategy

The standard merge strategy for this repository is **squash merge**. This keeps the commit history clean and concise by combining all changes from a pull request into a single commit.

In certain situations, such as when a pull request introduces logically distinct changes for frontend and backend, a **rebase merge** may be acceptable. This allows preserving individual commits for better traceability. However, when using rebase merge, pull request authors are expected to be judicious with the number of commits merged and ensure each commit represents a meaningful and self-contained change. Excessive granularity in commits should still be avoided. Please discuss with the reviewers if you believe a rebase merge is appropriate for your pull request.

## Review Process

Once you've submitted a Pull Request (PR) the various bots will come out and do their work:

- assigning reviewers from the various areas impacted by changes in your PR
- adding labels to help make reviewing PRs easier
- checking for missing changesets or confirming them
- checking for commits for their DCO (Developer Certificate of Origin)
- kick off the various CI builds

Once these have been completed it's just a matter of being patient as the reviewers have time they will begin to review your PR. When the review begins there may be a few layers to this but the general rule is that you need approval from one of the core maintainers and one from the specific area impacted by your PR. You may also have someone from the community review your changes, this can really help speed things up as they may catch some early items making the review for the maintainers simpler. Once you have the two (2) approvals it's ready to be merged, this task is also done by the maintainers.

### Review Tips

Here are a few things that can help as you go through the review process:

- You'll want to make sure all the automated checks are passing as generally the PR won't get a review if something like the CI build is failing
- PRs get automatically assigned so you don't need to ping people, they will be notified and have a process of their own for this
- If you are waiting for a review or mid-review and your PR goes stale one of the easiest ways to clear the stale bot is by simply rebasing your PR
- There are times where you might run into conflict with the `yarn.lock` during a rebase, to help with that make sure your `main` branch is up to date and then in your branch run `git checkout main yarn.lock` from the workspace too and then run `yarn install`, this will get you a conflict free `yarn.lock` file you can commit
