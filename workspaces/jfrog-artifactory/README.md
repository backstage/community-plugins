# jfrog-artifactory

This workspace contains a plugin for integrating [JFrog Artifactory](https://jfrog.com/artifactory/) with [Backstage](https://backstage.io/). This plugin allows Backstage users to view metadata from the JFrog Artifactory registry directly within the Backstage UI.

## Plugins

- [plugin-jfrog-artifactory](./plugin-jfrog-artifactory/README.md): Frontend plugin that adds a **JFROG ARTIFACTORY** tab to the entity view page in Backstage. It displays container image details such as version, repositories, manifest, modified date, and size.

## Notes

- Requires configuring a proxy to the Artifactory server in `app-config.yaml`.

For detailed installation and usage instructions, see the plugin-specific [README](./plugins/jfrog-artifactory/README.md).
