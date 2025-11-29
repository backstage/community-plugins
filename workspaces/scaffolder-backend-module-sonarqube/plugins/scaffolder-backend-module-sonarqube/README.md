# SonarQube actions for Backstage

This module provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [SonarQube](https://docs.sonarqube.org/latest/).

The following actions are currently supported in this module:

- `sonarqube:project:create` – Creates projects using shared SonarQube credentials that live in Backstage configuration (**recommended**)
- `sonarqube:create-project` – Legacy action that allows passing SonarQube credentials through template input (**deprecated**, kept for backward compatibility)

## Prerequisites

- A [Backstage](https://backstage.io/docs/getting-started/) project
- A [SonarQube](https://docs.sonarqube.org/latest/) instance

## Installation

Run the following command to install the action package in your Backstage project:

```console
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-sonarqube
```

### Installing the action on the new backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-sonarqube'),
);

backend.start();
```

## Configuration

Configure the SonarQube integration once in your Backstage backend:

```yaml title="app-config.yaml"
sonarqube:
  baseUrl: https://sonarqube.company.com
  token:
    $env: SONARQUBE_TOKEN # or any other secret source
```

Then add the module to your backend and reference the recommended action in your templates:

```yaml
action: sonarqube:project:create
id: create-sonar-project
name: Create SonarQube Project
input:
  projectKey: my-sonarqube-project
  projectName: My SonarQube Project
  organization: demo-org
  visibility: private
```

See the [examples](./examples/templates) directory for complete usage examples.

If you still rely on the legacy `sonarqube:create-project` action you can continue to pass the credentials directly inside the template input (see below), but please plan to migrate to the new action soon.

## Actions

### Action: sonarqube:project:create (recommended)

This action uses the shared SonarQube configuration, so no credentials need to be passed through the template.

#### Input

| Parameter Name |  Type  | Required | Description                                                                           | Example    |
| -------------- | :----: | :------: | ------------------------------------------------------------------------------------- | ---------- |
| projectKey     | string |   Yes    | Unique SonarQube project key                                                          | my-service |
| projectName    | string |   Yes    | Display name for the project                                                          | My Service |
| organization   | string |    No    | SonarQube organization key (only needed on SonarQube Cloud)                           | demo-org   |
| visibility     | string |    No    | Whether the project is `public` or `private`. Defaults to the SonarQube server value. | private    |

#### Output

| Name       |  Type  | Description                                  |
| ---------- | :----: | -------------------------------------------- |
| projectUrl | string | SonarQube project URL created by this action |

### Action: sonarqube:create-project (legacy / deprecated)

> **Warning**
>
> This action is kept for backwards compatibility. Please migrate to `sonarqube:project:create`, which avoids handling credentials in templates.

#### Input

| Parameter Name |  Type  | Required | Description                                                                                                              | Example                 |
| -------------- | :----: | :------: | ------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| baseUrl        | string |   Yes    | SonarQube Instance base URL                                                                                              | <http://sonar.acme.org> |
| name           | string |   Yes    | Name of the project to be created in SonarQube                                                                           | My Project              |
| key            | string |   Yes    | Key of the project to be created in SonarQube                                                                            | my-project              |
| branch         | string |    No    | Key of the main branch of the project. If not provided, the default main branch key will be used.                        | main                    |
| visibility     | string |    No    | Whether the created project should be visible to everyone, or only specific user/groups.                                 | private or public       |
| token          | string |    No    | SonarQube authentication [token](https://docs.sonarqube.org/latest/user-guide/user-account/generating-and-using-tokens/) |                         |
| username       | string |    No    | SonarQube username                                                                                                       |                         |
| password       | string |    No    | SonarQube password                                                                                                       |                         |

> Either the `token` or `username` and `password` input combination are required.
> If the three of them are provided, the `token` will take precedence.

#### Output

| Name       |  Type  | Description                                  |
| ---------- | :----: | -------------------------------------------- |
| projectUrl | string | SonarQube project URL created by this action |

## Programmatic usage

The package also exports a light-weight `SonarQubeClient` that can be used in custom code or other actions:

```ts
import { createSonarQubeClient } from '@backstage-community/plugin-scaffolder-backend-module-sonarqube';

const sonarQube = createSonarQubeClient({
  baseUrl: 'https://sonarqube.company.com',
  token: process.env.SONARQUBE_TOKEN!,
});

await sonarQube.createProject({
  project: 'my-service',
  name: 'My Service',
});
```

## Local testing

You can validate the new config-driven action against a local SonarQube instance.

1. Start SonarQube using the provided compose file:

   ```bash
   cd workspaces/scaffolder-backend-module-sonarqube
   docker compose -f docker-compose.test.yml up -d
   ```

   SonarQube will be available at `http://localhost:9000`.

2. Create an admin token in SonarQube (or reuse an existing one) and reference it from `plugins/scaffolder-backend-module-sonarqube/app-config.local.yaml`:

   ```yaml
   sonarqube:
     baseUrl: http://localhost:9000
     token: ${SONARQUBE_TOKEN}
   ```

   Export `SONARQUBE_TOKEN` in your shell so the config can resolve it.

3. Run the action tests from the plugin directory:

   ```bash
   cd plugins/scaffolder-backend-module-sonarqube
   yarn test src/actions/createConfiguredSonarQubeProject.test.ts --runTestsByPath
   ```

   When the base URL and token are available (either via env vars or `app-config.local.yaml`), the test suite automatically enables the “live” scenario and exercises the action against your running SonarQube container in addition to the mocked unit tests.
