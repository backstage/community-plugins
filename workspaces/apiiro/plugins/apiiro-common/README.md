# Apiiro Common Package for Backstage

The Apiiro common package provides shared constants used by both the frontend and backend Apiiro plugins for Backstage. This package centralizes key annotations and configuration defaults so they are defined in one place and stay consistent across the Apiiro plugin ecosystem.

## Overview

This package is a small common library that currently contains:

- **Catalog Annotations**: Shared annotation keys for linking Backstage entities to Apiiro repositories and for controlling metrics visibility
- **Configuration Defaults**: Shared defaults such as the Apiiro SaaS base URL

## Installation

This package is typically installed as a dependency when setting up the Apiiro plugins. If you need to install it separately:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-apiiro-common
```

## Usage

### Exports

The package re-exports everything from `src/constants.ts`:

- **`APIRO_PROJECT_ANNOTATION`**
- **`APIRO_METRICS_VIEW_ANNOTATION`**
- **`APIRO_DEFAULT_BASE_URL`**

```ts
import {
  APIIRO_PROJECT_ANNOTATION,
  APIIRO_METRICS_VIEW_ANNOTATION,
  APIIRO_DEFAULT_BASE_URL,
} from '@backstage-community/plugin-apiiro-common';
```

### `APIRO_PROJECT_ANNOTATION`

- Key: `apiiro.com/repo-id`
- Type: `string`
- Purpose: Identifies the Apiiro repository associated with a Backstage entity.

Example entity annotation:

```yaml
metadata:
  annotations:
    apiiro.com/repo-id: my-org/my-repo
```

### `APIRO_METRICS_VIEW_ANNOTATION`

- Key: `apiiro.com/allow-metrics-view`
- Type: `string` (usually interpreted as a boolean-like flag, e.g. `"true"`)
- Purpose: Controls whether Apiiro metrics (tiles / dashboards) and Widgets are allowed to be shown for a given entity.

Example entity annotation:

```yaml
metadata:
  annotations:
    apiiro.com/allow-metrics-view: 'true'
```

### `APIRO_DEFAULT_BASE_URL`

- Default: `https://app.apiiro.com`
- Purpose: Default base URL for the Apiiro SaaS application used by the plugins when constructing links or API calls.

Example usage in a frontend plugin:

```ts
import { APIIRO_DEFAULT_BASE_URL } from '@backstage-community/plugin-apiiro-common';

const url = `${APIRO_DEFAULT_BASE_URL}/some/path`;
```

## Dependencies

This package has minimal dependencies and is intended to remain lightweight as a shared constants library.

## Links

- [Frontend Plugin Documentation](../apiiro/README.md)
- [Backend Plugin Documentation](../apiiro-backend/README.md)
