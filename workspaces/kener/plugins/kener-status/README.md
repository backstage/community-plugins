# Kener Status Plugin for Backstage

## Overview

The Kener Status Plugin displays uptime and status badges from Kener in your Backstage system pages. This plugin allows teams to monitor their system's health and uptime directly within their Backstage environment.

![alt text](image.png)

## Features

- Display system status badges in system overview pages
- Show uptime metrics from Kener
- Configurable through entity annotations
- Responsive design with flexible layout options
- Available as both a status card and a full page view

## Getting Started

### For Users

#### Installation

Install the plugin in your Backstage app:

```bash
# From your Backstage root directory
yarn add --cwd packages/app @backstage/plugin-kener-status
```

#### Usage

Add the plugin to your Backstage app:

```typescript
// packages/app/src/plugins.ts
export { plugin as KenerStatusPlugin } from '@backstage/plugin-kener-status';
```

Add the status card to your entity pages:

```typescript
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityKenerStatusCard } from '@backstage/plugin-kener-status';

// For Systems
const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityKenerStatusCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

// For Services
const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item md={6}>
          <EntityKenerStatusCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

// For Websites
const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item md={6}>
          <EntityKenerStatusCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

// For APIs
const apiEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item md={6}>
          <EntityKenerStatusCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);
```

Add the required annotations to your system entities:

```yaml
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: example-system
  annotations:
    kener/uptimeBadge: 'https://kener.ing/badge/aws/uptime'
    kener/statusBadge: 'https://kener.ing/badge/aws/status'
```

## License

This project is licensed under the Apache-2.0 License.
