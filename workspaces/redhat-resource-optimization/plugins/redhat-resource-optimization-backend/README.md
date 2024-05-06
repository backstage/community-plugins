# Resource Optimization back-end plugin

Welcome to the redhat-resource-optimization backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

This workspace includes a [devcontainer](../../.devcontainer/devcontainer.json) configuration, this is the recommended way for setting up a local dev-environment. Just open the [redhat-resource-optimization.code-workspace](../../redhat-resource-optimization.code-workspace) file with VSCode and choose to open this workspace in the preconfigured devcontiner when the prompt appears.

The plugin has been added to the example app in this workspace, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to http://localhost:3000/redhat-resource-optimization.
The health check endpoint for this back-end is available at: http://localhost:7007/api/resourceOptimizationPlugin/health.

You can also serve the plugin in isolation by running `yarn start:dev` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.
