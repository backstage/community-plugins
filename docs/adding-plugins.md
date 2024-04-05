## License

The community plugins repository is under _“Apache 2.0”_ license. All plugins added & moved to the repository will be kept under the same license. If you are moving a plugin over make sure that no other license file is in the plugin workspace & all `package.json` files either have no version defined or explicitly use _“Apache 2.0”_.

## Naming

For workspaces the name should reflect the name of the plugins contained in a simple manner (e.g. for the plugins `todo` & `todo-backend` the workspace would be called `todo`).

For plugins we will continue to follow the naming pattern suggested by the ADR on the main repository: https://backstage.io/docs/architecture-decisions/adrs-adr011.

## Versioning

For the versioning all packages in this repository are following the semantic versioning standard enforced through Changesets. This is the same approach as in the main “backstage/backstage” repository. If this is your first time working with Changesets checkout this documentation: https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#creating-changesets.

When adding a new plugin you don’t have to think much about the versioning. Just create an initial changeset by running `yarn changeset` in the plugin workspace & make sure the version in the `package.json` of each plugin is either on `0.0.1` if this is early release of the plugin or `1.0.0` if you expect less breaking changes in the future.

When moving an existing plugin into the community plugins repository you should spend a minute thinking about how you want to continue your versioning. As the plugin is under a different scope (`@backstage-community`) one option is to just start at `1.0.0` again allowing existing end users to move over by using the range `^1.0.0`. Alternatively you can also just continue at the last version where the prior package was deprecated. In this case only the npm package name would need to change.

## Release

As soon as your plugin is part of the community plugins repository every PR with a change is expected to contain a changeset. As soon as the PR is merged a follow up PR will be created called _“Version Packages (your-plugin-name)”_. This version packages PR will remove the merged changeset & add it to the changelog for the specific plugin. Additionally the version in the `package.json` is adjusted.

A release is automatically triggered by merging the plugins “Version Packages” PR.
