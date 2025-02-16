# Amplication Processor plugin

Welcome to the Amplication Processor plugin!

This plugin is designed to process amplication templates from the Amplication API and add them to the Backstage catalog, alongside with three other entities:

- Kind: user:amplication-bot
- Kind: System
- Kind: API

## Prerequisites

- Amplication Token

## Usage

Install the plugin by running the following command **from your Backstage root directory**

`yarn --cwd packages/app add @backstage-community/plugin-catalog-backend-module-amplication`

Add the collator to your backend instance, along with the search plugin itself:

```tsx
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(
  import('@backstage-community/plugin-catalog-backend-module-amplication'),
);
backend.start();
```

## Configuration

Configure your `app-config.yaml` with Amplication's configuration

```yaml title="app-config.yaml"
amplication:
  appUrl: https://app.amplication.com
  apiUrl: https://server.amplication.com/graphql
  token: ${AMPLICATION_TOKEN}
```

## Troubleshooting

If you encounter any issues, please refer to the [Amplication documentation](https://docs.amplication.com) for more information.

If the issue persists, please contact the Amplication support team.
