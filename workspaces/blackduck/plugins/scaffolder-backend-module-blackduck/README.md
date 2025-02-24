# @backstage-community/plugin-scaffolder-backend-module-blackduck

Welcome to the Blackduck scaffolder module.

Available actions:

1. `blackduck:create:project` to create Blackduck project along with version.

## Getting Started

Before you start make sure your existing backstage instance is already setup with [BlackDuck backend plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/blackduck/plugins/blackduck-backend)

### Installation

This module needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-scaffolder-backend-module-blackduck
```

### Configuration(New Backend System)

This backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-scaffolder-backend-module-blackduck'));

  // ...

  backend.start();
```

### Example template

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: blackduck-create-project
  title: Blackduck Template to Create Project
  description: Template to create projects in BlackDuck instance
spec:
  owner: guests
  type: service

  parameters:
    - title: Provide informance to create project
      required:
        - projectName
      properties:
        projectName:
          title: Name
          type: string
          description: Unique name of the project
  steps:
    - id: blackduck-create-project
      name: Blackduck Create Project
      action: blackduck:create:project
      input:
        projectName: ${{parameters.projectName}}
```
