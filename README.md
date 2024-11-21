# Advanced Cluster Security Backstage Plugin

This is a development mono-repo for the Advanced Cluster Security plugin. This mono-repo was created using @backstage/create-app to provide a frontend for the plugin to integrate with.

You can find the plugin code in plugins/acs

## Development

The `ACS_API_URL` and `ACS_API_KEY` will need to be set in order for the route to work in the `app-config.yaml` file. The purpose of this route is to access data from the ACS endpoint.

To start the app, run:
```sh
yarn install
yarn dev
```
