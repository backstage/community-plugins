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

See the individual plugin READMEs linked above for installation and configuration instructions.

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
