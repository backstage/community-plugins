# Lighthouse Backend

Lighthouse Backend allows you to run scheduled lighthouse Tests for each Website with the annotation `lighthouse.com/website-url`.

## Setup

The Lighthouse backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

1. Install the plugin using:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-lighthouse-backend
```

2. In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-lighthouse-backend'));

  backend.start();
```

## Configuration

You can define how often and when the scheduler should run the audits:

```yaml
lighthouse:
  schedule:
    frequency:
      hours: 12 # Default: 1 day
    timeout:
      minutes: 30 # Default: 10 minutes
```
