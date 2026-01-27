# @backstage-community/plugin-nomad-backend

A backend for [Nomad](https://www.nomadproject.io/), this plugin exposes a service with routes to query Job and Group information from a Nomad API.

## Setup

Install the plugin using:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-nomad-backend
```

In your `packages/backend/src/index.ts` make the following changes:

```ts
import { createBackend } from '@backstage/backend-defaults';
const backend = createBackend();
// ... other feature additions
backend.add(import('@backstage-community/plugin-nomad-backend'));
backend.start();
```

Note: for this backend to work, the `nomad` configuration described in the README of `@backstage-community/plugin-nomad` must be implemented.
