# ServiceNow Backend Plugin

This is the backend implementation of the ServiceNow plugin for Backstage.

It provides an API that connects to your ServiceNow instance and returns incident data for catalog entities.

## Installation

1. **Install the frontend plugin**:

   This plugin is installed via the `@backstage-community/plugin-servicenow-backend` package. To install it to your backend package, run the following command:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/backend add @backstage-community/plugin-servicenow-backend
   ```

2. Then add the plugin to your backend in `packages/backend/src/index.ts`:

   ```ts
   const backend = createBackend();
   // ...
   backend.add(import('@backstage-community/plugin-servicenow-backend'));
   ```

## Configuration

Refer to [Configuration.md](../../docs/Configuration.md) for detailed setup instructions, including authentication and ServiceNow instance configuration.

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.
