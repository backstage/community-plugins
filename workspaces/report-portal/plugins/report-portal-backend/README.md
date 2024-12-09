# report-portal

Welcome to the report-portal backend plugin!

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/report-portal](http://localhost:3000/report-portal).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Installation

### Install backend plugin

- Install the plugin
  ```shell
  yarn workspace backend add @backstage-community/plugin-report-portal-backend
  ```
- Update the following files

  - Create `/packages/backend/src/index.ts` and add following code:

    ```ts
    import { createBackend } from '@backstage/backend-defaults';
    const backend = createBackend();
    // All other plugins
    //...
    // add report portal plugin
    backend.add(import('@backstage-community/plugin-report-portal-backend'));
    backend.start();
    ```

- Add below configuration to `app-config.yaml`:

  ```yaml
  reportPortal:
    # Contact email for support
    supportEmail: ${REPORT_PORTAL_SUPPORT_MAIL}

    # under integrations you can configure
    # multiple instances of report portal
    integrations:
      # host address of your instance
      # for e.g: report-portal.mycorp.com
      - host: ${REPORT_PORTAL_HOST}

        # Baser API url of your instance
        # for e.g: https://report-portal.mycorp.com/api/
        baseUrl: ${REPORT_PORTAL_BASE_URL}

        # Get the API key from profile page of your instance
        # for e.g: Bearer fae22be1-0000-0000-8392-de1635eed9f4
        token: ${REPORT_PORTAL_TOKEN}

        # (optional) Filter the projects by type
        # Default: "INTERNAL"
        filterType: 'INTERNAL'
  ```

### Installing [frontend plugin](../report-portal/)

- Install the plugin using following command
  ```shell
  yarn workspace app add @backstage-community/plugin-report-portal
  ```
