# GrowthBook Feature Flags for Backstage

View GrowthBook feature flags directly in Backstage catalog entities.

## Overview

This workspace contains plugins for integrating GrowthBook feature flag management into Backstage. Adds feature flags view tab on entity pages with filtering and detailed JSON value inspection.

## Features

- Display feature flags with types and default values
- Can filter by GrowthBook project
- Backend proxy to Growthbook API
- JSON detailed popup dialog

## Plugins

- **[@backstage-community/plugin-growthbook](./plugins/growthbook/README.md)**: Frontend plugin providing UI components and entity page integration
- **[@backstage-community/plugin-growthbook-backend](./plugins/growthbook-backend/README.md)**: Backend plugin providing API proxy and caching

## Getting Started

### Installation

```bash
# Frontend
yarn workspace app add @backstage-community/plugin-growthbook

# Backend
yarn workspace backend add @backstage-community/plugin-growthbook-backend
```

### Quick Setup

1. **Backend**: Add to `packages/backend/src/index.ts`:

   ```typescript
   backend.add(import('@backstage-community/plugin-growthbook-backend'));
   ```

2. **Frontend**: Register API in `packages/app/src/apis.ts` and add to EntityPage (see [frontend README](./plugins/growthbook/README.md))

3. **Configure** `app-config.yaml`:

   ```yaml
   growthbook:
     baseUrl: ${GROWTHBOOK_BASE_URL}
     secretKey: ${GROWTHBOOK_SECRET_KEY}
     sdkKeys:
       prod: ${GROWTHBOOK_SDK_KEY_PROD}
   ```

4. **Annotate entities** in `catalog-info.yaml`:
   ```yaml
   metadata:
     annotations:
       growthbook.io/enabled: "true"
       growthbook.io/env: "prod"
       growthbook.io/project: "my-project" // if no project scope, all project flags will be displayed
   ```

## Development

To develop this workspace locally:

```sh
yarn install
yarn start
```

## License

Apache-2.0

## Author

Zaki Hanafiah <zaki@zakhov.com>
