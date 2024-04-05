# Backstage Community Plugins

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CNCF Status](https://img.shields.io/badge/cncf%20status-incubation-blue.svg)](https://www.cncf.io/projects)
[![Discord](https://img.shields.io/discord/687207715902193673?logo=discord&label=Discord&color=5865F2&logoColor=white)](https://discord.gg/backstage-687207715902193673)

## What is the community-plugins repository?

The `community-plugins` repository is a place where members of the community can host a plugin or a set of plugins. The goal of community-plugins is to reduce the amount of pull requests and issues from `backstage/backstage`, which has become too big with the time.
By creating community-plugins we give to plugin maintainers all the tools to easily manage and publish their plugins.

## Contributing a plugin

Plugins created by the wider Backstage community are welcome to be published in the `community-plugins` repository. When you contribute a plugin to this repository, you agree to follow specific guidelines, including a standardized release process. This allows plugin owners to leverage established processes and the collective knowledge of the Backstage `community-plugins` community.

For those seeking full autonomy over their plugin's development and release lifecycle, self-hosting remains a supported and valid option. The decision to either contribute to the community repository or self-host will depend on whether you prefer to manage the development of the plugin independently or develop the plugin as part of a community-driven process. Both approaches are valued within the Backstage ecosystem and contribute to its growth.

Plugins that are key to the functionality and operation of Backstage will continue to reside in the `backstage/backstage` repository - ensuring the central components that underpin the platform are centrally managed and maintained.

## Repository layout

`community-plugins` is formed by a set of workspaces. A workspace holds a plugin or a set of plugins based on a specific topic. For example, catalog, kubernetes, and TechDocs can be referred to as workspaces.
Each plugin belongs to a workspace and workspaces are portable enough to be moved to its own repo if desired.

## Release Management

Changesets have proven to be a reliable method for managing different versions of packages.
Each plugin workspace has its own changesets and isolated releases. Plugins that depend on other plugins via regular NPM dependencies, regardless of whether the other plugins are core plugins, other plugins within the community repo, or external plugins.
Although the community repository isn't technically a "yarn workspace", it functions as a repository with multiple sub yarn workspaces, with each workspace possessing its unique .changesets directory.

Whenever a new changeset is introduced, a fresh "Version packages ($workspace_name)" PR is produced. Merging a Version packages PR will trigger the release of all the plugins in the workspaces (provided changesets have been added), and also update the `CHANGELOG` files.

## How to create a new workspace

```bash
$ yarn create-workspace
```
