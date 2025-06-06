# MTA Plugin (Migration Toolkit for Applications)

Welcome to the MTA plugin for Backstage!

This plugin provides integration with the Migration Toolkit for Applications (MTA) service, allowing
you to manage and analyze applications for migration.

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access
it by running `yarn start` in the root directory, and then navigating to
[/mta](http://localhost:3000/mta).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory. This
method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev)
directory.

## Authentication Setup

This plugin requires proper authentication with Keycloak to access the MTA API. If authentication is
not set up correctly, you may experience 401 errors that can cause navigation issues in the UI.

**Important:** You must configure your Keycloak client with the appropriate scopes to use this
plugin.

See our [RHDH Setup Guide](https://konveyor.github.io/rhdh-documentation/) for detailed instructions
on setting up the Keycloak client.

## Deployment

For information on deploying this plugin with Red Hat Developer Hub (RHDH), see:

- [RHDH Setup Guide](https://konveyor.github.io/rhdh-documentation/) - Comprehensive guide for
  deploying with RHDH

## Troubleshooting

If you encounter issues with navigation or authentication:

1. Ensure your Keycloak client is properly configured with the required scopes
2. Check that your authentication tokens are valid
3. Verify that your Backstage instance has the correct configuration

### Authentication Error Handling

This plugin includes improved error handling for authentication issues:

- Graceful handling of 401 errors without page navigation disruptions
- Detailed error messages with specific instructions for fixing Keycloak configuration
- Retry buttons that allow users to attempt requests again after fixing authentication issues
- Prevention of hard refreshes and URL issues when authentication errors occur

For more details on authentication setup and troubleshooting, see our
[RHDH Setup Guide](https://konveyor.github.io/rhdh-documentation/).
