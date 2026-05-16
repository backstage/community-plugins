# @backstage-community/plugin-ilert

## Introduction

[ilert](https://www.ilert.com) The AI-first platform for on-call, incident response, and status pages – eliminating the interrupt tax across your stack.

## Overview

This plugin integrates ilert into Backstage and provides an overview of operational information such as alerts, on-call schedules, services, and status pages.

It allows users to:

- See who is currently on-call
- View active alerts
- Trigger alerts directly from Backstage for configured alert sources
- View services and their current status
- Access status pages

### Features

This plugin provides the following functionality:

- View details about the current on-call person (including all escalation levels)
- Override the current on-call assignment
- View a list of active alerts
- Trigger a new alert
- Reassign, acknowledge, or resolve an alert
- Trigger alert actions
- Enable or disable an alert source
- Start immediate maintenance
- View services and their current status
- Access configured status pages

## Setup instructions

Install the plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-ilert
```

Add it to the `EntityPage.tsx`:

```ts
import {
  isPluginApplicableToEntity as isILertAvailable,
  EntityILertCard,
} from '@backstage-community/plugin-ilert';

// ...
<EntitySwitch>
  <EntitySwitch.Case if={isILertAvailable}>
    <Grid item sm={6}>
      <EntityILertCard />
    </Grid>
  </EntitySwitch.Case>
</EntitySwitch>;
// ...
```

> To force an ilert card for each entity just add the `<EntityILertCard />` component. An instruction card will appear if no integration key is set.

## Add ilert explorer to the app sidebar

Modify your app routes in [`App.tsx`](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx) to include the Router component exported by the plugin - for example:

```tsx
import { ILertPage } from '@backstage-community/plugin-ilert';
<FlatRoutes>
  // ...
  <Route path="/ilert" element={<ILertPage />} />
  // ...
</FlatRoutes>;
```

Modify your sidebar in [`Root.tsx`](https://github.com/backstage/backstage/blob/master/packages/app/src/components/Root/Root.tsx) to include the icon component exported by the plugin - for example:

```tsx
import { ILertIcon } from '@backstage-community/plugin-ilert';
<Sidebar>
  // ...
  <SidebarItem icon={ILertIcon} to="ilert" text="ilert" />
  // ...
</Sidebar>;
```

## Client configuration

If you want to override the default URL for api calls and detail pages, you can add it to `app-config.yaml`.

In `app-config.yaml`:

```yaml
ilert:
  baseUrl: https://my-org.ilert.com/
```

## Providing the Authorization Header

In order to make the API calls, you need to provide a new proxy config which will redirect to the [ilert API](https://api.ilert.com/api-docs/) endpoint. It needs an [Authorization Header](https://api.ilert.com/api-docs/#section/Authentication).

Add the proxy configuration in `app-config.yaml`

```yaml
proxy:
  ...
  '/ilert':
    target: https://api.ilert.com
    allowedMethods: ['GET', 'POST', 'PUT']
    allowedHeaders: ['Authorization']
    headers:
      Authorization: ${ILERT_AUTH_HEADER}
```

Then start the backend, passing the authorization header (bearer token or basic auth) as environment variable:

```bash
$ ILERT_AUTH_HEADER='<ILERT_AUTH>' yarn start
```

## Integration Key

The information displayed for each entity is based on the alert source integration key.

### Adding the integration key to the entity annotation

If you want to use this plugin for an entity, you need to label it with the below annotation:

```yml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example
  annotations:
    ilert.com/integration-key: [INTEGRATION_KEY]
```
