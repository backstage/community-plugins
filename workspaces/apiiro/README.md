# Apiiro Plugin for Backstage

The Apiiro plugin empowers developers to code securely by automatically checking for security vulnerabilities. Developers can review and address newly introduced vulnerabilities by Apiiro directly in Backstage, reducing overall application security risk and delivering more secure applications.

### Plugins

This repository contains the following plugin packages:

1. **[@backstage-community/plugin-apiiro](./plugins/apiiro)** - Frontend plugin providing the Apiiro dashboard, tab, widget, and sidebar integrations in Backstage
2. **[@backstage-community/plugin-apiiro-backend](./plugins/apiiro-backend)** - Backend plugin that integrates with the Apiiro platform and exposes APIs for the frontend
3. **[@backstage-community/plugin-apiiro-common](./plugins/apiiro-common)** - Shared constants (annotations, defaults) used by both frontend and backend plugins
4. **[@backstage-community/plugin-catalog-backend-module-apiiro-entity-processor](./plugins/catalog-backend-module-apiiro-entity-processor)** - Catalog backend module that automatically derives and adds Apiiro annotations to entities based on their source location

## Quick Start

You will find detailed installation instructions in each plugin's readme file.

### Installation

```sh
# From your Backstage root directory
# install backend
yarn --cwd packages/backend add @backstage-community/plugin-apiiro-backend

# install frontend
yarn --cwd packages/app add @backstage-community/plugin-apiiro

# install catalog module ( Optional )
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-apiiro-entity-processor

# the apiiro page will be available at /apiiro
# see the READMEs in the frontend and backend plugin for more details
```

## How does it look?

- **Dashboard View**: Repository list with comprehensive statistics from Apiiro
  ![Apiiro Dashboard](./assets/dashboard.png)
- **Apiiro Tab**: Detailed risk metrics and security insights for each repository
  ![Apiiro Tab](./assets/apiiro-tab.png)
- **Apiiro Widget**: Embeddable widget for custom entity tabs
  ![Apiiro Widget](./assets/apiiro-widget.png)

## Development

```sh
# Install dependencies
yarn install

# Start the development server
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).
