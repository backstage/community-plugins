# Backstage Community Plugins

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CNCF Status](https://img.shields.io/badge/cncf%20status-incubation-blue.svg)](https://www.cncf.io/projects)
[![Discord](https://img.shields.io/discord/687207715902193673?logo=discord&label=Discord&color=5865F2&logoColor=white)](https://discord.gg/backstage-687207715902193673)

## What is the community-plugins repository?

The `community-plugins` repository is a place where members of the community can collaborate to develop, maintain, and share plugins. This initiative was originally driven by the need to separate plugin maintenance from the `backstage/backstage` core repository.

This repository is designed to provide plugin maintainers with tools and workflows to efficiently manage and publish Backstage plugins.

## Contributing a plugin

Plugins created by the wider Backstage community are welcome to be published in the `community-plugins` repository. When you contribute a plugin to this repository, you agree to follow specific guidelines, including a standardized release process. This allows plugin owners to leverage established processes and the collective knowledge of the Backstage `community-plugins` community.

For those seeking full autonomy over their plugin's development and release lifecycle, self-hosting remains a supported and valid option. The decision to either contribute to the community repository or self-host will depend on whether you prefer to manage the development of the plugin independently or develop the plugin as part of a community-driven process. Both approaches are valued within the Backstage ecosystem and contribute to its growth.

Plugins that are key to the functionality and operation of Backstage will continue to reside in the `backstage/backstage` repository - ensuring the central components that underpin the platform are centrally managed and maintained.

To get started with creating a new plugin, follow the guidance in [CONTRIBUTING.md](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#creating-a-new-workspace).

## Community Plugins Workflow

The `community-plugins` repository is formed by a set of workspaces. A workspace holds a plugin or a set of plugins based on a specific topic. For example, catalog, kubernetes, and TechDocs can be referred to as workspaces.

Each plugin belongs to a workspace and workspaces are portable enough to be moved to its own repository if desired. Each plugin workspace has its own changesets and isolated releases.

Plugins depend on other plugins via regular npm dependencies, regardless of whether the other plugins are core plugins, other plugins within the repository, or external plugins.

Although the community repository isn't technically a yarn workspace", it functions as a repository with multiple yarn workspaces, with each workspace possessing its unique `.changesets` directory.

Whenever a new changeset is introduced, a fresh "Version packages ($workspace_name)" PR is produced. Merging a Version packages PR will trigger the release of all the plugins in the workspaces (provided changesets have been added), and also update the `CHANGELOG` files.

## Plugins migrated from `backstage/backstage`

A number of plugins that originally resided in `backstage/backstage` monorepo have moved to this `backstage/community-plugins` repository.

<details>
<summary>List of migrated plugins</summary>

- `adr`
- `airbreak`
- `allure`
- `analytics`
- `apache-airflow`
- `apollo-explorer`
- `azure-devops`
- `azure-sites`
- `badges`
- `bazaar`
- `bitrise`
- `cicd-statistics`
- `cloudbuild`
- `code-climate`
- `code-coverage`
- `codescene`
- `cost-insights`
- `dynatrace`
- `entity-feedback`
- `entity-validation`
- `example-todo-list`
- `explore`
- `firehydrant`
- `fossa`
- `gcalendar`
- `gcp-projects`
- `git-release-manager`
- `github-actions`
- `github-deployments`
- `github-issues`
- `github-pull-requests-board`
- `gitops-profiles`
- `gocd`
- `graphiql`
- `graphql-voyager`
- `ilert`
- `jenkins`
- `kafka`
- `lighthouse`
- `microsoft-calendar`
- `newrelic`
- `newrelic-dashboard`
- `octopus-deploy`
- `opencost`
- `periskop`
- `playlist`
- `puppetdb`
- `rollbar`
- `sentry`
- `shortcuts`
- `sonarqube`
- `splunk`
- `stack-overflow`
- `stackstorm`
- `tech-insights`
- `tech-radar`
- `todo`
- `vault`
- `xcmetrics`
</details>

### Migration process

The migration of plugins from the `backstage/backstage` monorepo to the `community-plugins` repository was automated under the `community-cli` tool.

You provide it with a path to the `monorepo` which should be cloned locally, and a plugin ID. It will then create a new workspace in the `community-plugins` repository with all of the plugins and modules that surround that workspace. For instance, if I use the `todo` plugin as an ID, It will automatically move over `@backstage/plugin-todo` as well as `@backstage/plugin-todo-backend` and any other `-common`, `-node` or `-modules` that are related.

Once the code is copied over, the npm scopes and all code references are updated to reflect the new scopes of `@backstage-community/plugin-*`, and a changeset is created for the package to be published. The versions are kept the same for now, but the resulting changeset will publish the next version along, so if the package released at `1.25.0` was `0.10.0` then the new version will be `@backstage-community/plugin-todo` `0.10.1`.

There is a commit that is created in the `monorepo` on either a specified branch as `--branch` or on a new branch that is created for the migration. In this commit is a deprecation and a changeset for this package to go out, so `0.10.1` in `@backstage/plugin-todo` will be marked as deprecated and replaced with `@backstage-community/plugin-todo` as the same version.
