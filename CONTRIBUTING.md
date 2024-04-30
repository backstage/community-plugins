# Contributing to `backstage/community-plugins`

The `backstage/community-plugins` repository is designed as a collaborative space for Backstage community members to host and manage their plugins for Backstage. This repository will provide plugin maintainers with tools for plugin management and publication. By contributing a plugin to this repository, maintainers agree to adhere to specific guidelines and a standardized release process detailed in this guide.

If you have questions or feedback regarding Community Plugins, you can visit the [Community Plugins #general channel](https://discord.com/channels/687207715902193673/1211692810294788126) in the Backstage [Discord](https://discord.gg/backstage-687207715902193673).

## Table of Contents

- [Contributing to `backstage/community-plugins`](#contributing-to-backstagecommunity-plugins)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)
  - [Security Issues](#security-issues)
  - [Get Started!](#get-started)
  - [Coding Guidelines](#coding-guidelines)
  - [Versioning](#versioning)
  - [Creating Changesets](#creating-changesets)
  - [Creating a new Workspace](#creating-a-new-workspace)
  - [Creating new plugins or packages in a Workspace](#creating-new-plugins-or-packages-in-a-workspace)
  - [Release](#release)
  - [Developer Certificate of Origin](#developer-certificate-of-origin)

## Code of Conduct

By contributing to Backstage Community Plugins you agree to adhere to the [CNCF Code of Conduct][code-of-conduct].

[code-of-conduct]: https://github.com/cncf/foundation/blob/main/code-of-conduct.md

## License

The community plugins repository is under [Apache 2.0](../LICENSE) license. All plugins added & moved to the repository will be kept under the same license. If you are moving a plugin over make sure that no other license file is in the plugin workspace & all `package.json` files either have no version defined or explicitly use _“Apache 2.0”_.

## Security Issues

See [SECURITY](SECURITY.md).

## Get Started!

So...feel ready to jump in? Let's do this. 👏🏻 💯

### Cloning the Repository

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

Frontend and Backend plugins come with a standalone runner that you should be able to utilize in order to develop on your plugins in isolation. You can navigate to a workspace and a plugin inside the plugin folder and run `yarn start` which should kick off the development standalone server for that plugin.

There could be times when there is a need for a more rich development environment for a workspace. Say that the workspace and it's plugin depend on a full catalog, and maybe the kubernetes plugin already running too, that could be a bit of a pain to set up. In that case, there might be a full Backstage environment that you can run with `yarn dev` in the workspace root, which will start up a full Backstage environment located in `$WORKSPACE_ROOT/packages/app` and `$WORKSPACE_ROOT/packages/backend`.

> [!IMPORTANT]  
> This full Backstage environment is not setup by default, and is setup on a per workspace basis. Check out the workspace `README.md` for more information on how to get a dev environment setup for each plugin.

## Coding Guidelines

All code is formatted with `prettier` using the configuration in the repo. If possible we recommend configuring your editor to format automatically, but you can also use the `yarn prettier --write <file>` command to format files.

## Versioning

For the versioning all packages in this repository are following the semantic versioning standard enforced through Changesets. This is the same approach as in the main “backstage/backstage” repository. If this is your first time working with Changesets checkout [this documentation](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#creating-changesets) or read a quick summary below.

## Creating Changesets

We use [changesets](https://github.com/atlassian/changesets) to help us prepare releases. They help us make sure that every package affected by a change gets a proper version number and an entry in its `CHANGELOG.md`. To make the process of generating releases easy, it helps when contributors include changesets with their pull requests. These changesets can be created by going into a `workspace` directory and running `yarn changeset` and following the prompts.

```bash
cd community-plugins
cd workspaces/linguist
yarn changeset # follow the prompts
```

## Release

As soon as a plugin is part of the community plugins repository every PR with a change is expected to contain a changeset. As soon as the PR is merged a follow up PR will be created called _“Version Packages (your-plugin-name)”_. This version packages PR will remove the merged changeset & add it to the changelog for the specific plugin. Additionally the version in the `package.json` is adjusted.

A release is automatically triggered by merging the plugins “Version Packages” PR.

## Creating a new Workspace

For workspaces the name should reflect the name of the plugins contained in a simple manner (e.g. for the plugins `todo` & `todo-backend` the workspace would be called `todo`).

For plugins we will continue to follow the naming pattern suggested by the ADR on the main repository: https://backstage.io/docs/architecture-decisions/adrs-adr011.

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

## Developer Certificate of Origin

Backstage Community Plugins has adopted a [Developers Certificate of Origin (DCO)](https://developercertificate.org/) - refer to the Backstage [CONTRIBUTING.md#developer-certificate-of-origin](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#developer-certificate-of-origin) for more information on the DCO and guidance on signing commits.
