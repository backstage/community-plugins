# sonarqube-backend

Welcome to the sonarqube-backend backend plugin!

This plugin needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-sonarqube-backend
```

## New Backend System

The Sonarqube backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
+ backend.add(import('@backstage-community/plugin-sonarqube-backend'));
  backend.start();
```

#### Example - Single global instance

##### Config

```yaml
sonarqube:
  baseUrl: https://sonarqube.example.com
  apiKey: 123456789abcdef0123456789abcedf012
  authType: Bearer # this defaults to Basic, it can be set to Bearer or Basic
```

##### Catalog

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage
  annotations:
    sonarqube.org/project-key: YOUR_PROJECT_KEY # this is the project key in Sonarqube, not the project name. It can be found in the URL of the project in Sonarqube, or in the project settings.
```

#### Example - Multiple global instance

If you have multiple Sonarqube instances, you can configure them all in the config and specify which one to use in the catalog annotation:

##### Config

```yaml
sonarqube:
  instances:
    - name: default
      baseUrl: https://default-sonarqube.example.com
      apiKey: 123456789abcdef0123456789abcedf012
    - name: specialProject
      baseUrl: https://special-project-sonarqube.example.com
      apiKey: abcdef0123456789abcedf0123456789ab
    - name: cloud
      baseUrl: https://sonarcloud.io
      apiKey: 0123456789abcedf012123456789abcdef
```

##### Catalog

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage
  annotations:
    sonarqube.org/project-key: specialProject/YOUR_PROJECT_KEY # this is the project key in Sonarqube, not the project name. It can be found in the URL of the project in Sonarqube, or in the project settings. The part before the / is the instance name, and the part after is the project key.
```

If the `specialProject/` part is omitted (or replaced with `default/`), the Sonarqube instance of name `default` will be used.

#### Example - Different frontend and backend URLs

In some instances, you might want to use one URL for the backend and another for the frontend.
This can be achieved by using the optional `externalBaseUrl` property in the config.

##### Single instance config

```yaml
sonarqube:
  baseUrl: https://sonarqube-internal.example.com
  externalBaseUrl: https://sonarqube.example.com
  apiKey: 123456789abcdef0123456789abcedf012
```

## Links

- [Sonarqube Frontend](../sonarqube/README.md)
