# Backstage Community Plugins

## What is the community-plugins repository?

The `community-plugins` repository is a place where members of the community can host a plugin or a set of plugins. The goal of community-plugins is to reduce the amount of pull requests and issues from `backstage/backstage`, which has become too big with the time.
By creating community-plugins we give to plugin maintainers all the tools to easily manage and publish their plugins.

## Repository layout

`community-plugins` is formed by a set of workspaces. A workspace holds a plugin or a set of plugins based on a specific topic. For example, catalog, k8s, TechDocs can be referred to as workspaces.
Each plugin belongs to a workspace and workspaces are portable enough to be moved to its own repo if desired.

## Release Management

Changesets have proven to be a reliable method for managing different versions of packages.
Each plugin workspace has its own changesets and isolated releases. Plugins that depend on other plugins via regular NPM dependencies, regardless of whether the other plugins are core plugins, other plugins within the community repo, or external plugins.
Although the community repository isn't technically a "yarn workspace", it functions as a repository with multiple sub yarn workspaces, with each workspace possessing its unique .changesets directory.

Whenever a new changeset is introduced, a fresh "Version packages ($workspace_name)" PR is produced. Merging a Version packages PR will trigger the release of all the plugins in the workspaces (provided changesets have been added), and also update the CHANGELOGS.

## How to create a new workspace

```bash
$ yarn create-workspace
```
