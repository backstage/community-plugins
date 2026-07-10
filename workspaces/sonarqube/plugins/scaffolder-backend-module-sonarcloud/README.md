# @backstage-community/plugin-scaffolder-backend-module-sonarcloud

Backstage scaffolder backend module providing actions for SonarCloud project onboarding.

## What it does

Five scaffolder actions that automate the full SonarCloud project onboarding flow within Backstage Software Templates:

| Action                               | Purpose                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `sonarcloud:project:create`          | Creates a new project in SonarCloud                                        |
| `sonarcloud:project:bind`            | Binds a project to a GitHub, GitLab, Bitbucket, or Azure DevOps repository |
| `sonarcloud:defaultBranch:rename`    | Renames the default branch tracked by SonarCloud                           |
| `sonarcloud:qualityGate:assign`      | Assigns a quality gate to the project (by name)                            |
| `sonarcloud:newCodeDefinition:set`   | Configures the new code period boundary                                    |

## Difference from the SonarQube plugin

| Feature                 | SonarQube plugin          | SonarCloud plugin (this)                      |
| ----------------------- | ------------------------- | --------------------------------------------- |
| Auth mechanism          | Basic (username:password) | Bearer token                                  |
| Organization support    | Not supported             | Required                                      |
| ALM binding             | No                        | Yes (GitHub, GitLab, Bitbucket, Azure DevOps) |
| Branch rename           | No                        | Yes                                           |
| Quality gate assignment | No                        | Yes (resolved by name)                        |
| New code definition     | No                        | Yes                                           |
| Idempotent              | No                        | Yes                                           |

## Prerequisites

- A Backstage instance running the [New Backend System](https://backstage.io/docs/backend-system/)
- A SonarCloud organization with an API token (generated at [sonarcloud.io > My Account > Security](https://sonarcloud.io/account/security))
- For ALM binding: an ALM integration configured in your SonarCloud organization settings

## Installation

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-scaffolder-backend-module-sonarcloud
```

Then register the module in `packages/backend/src/index.ts`:

```ts
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-sonarcloud'),
);
```

## Configuration

The plugin reads defaults from the shared `sonarqube` config block in `app-config.yaml`:

```yaml
sonarqube:
  apiKey: ${SONARCLOUD_TOKEN}
  organizationName: my-org
```

`token` and `organization` are read exclusively from app-config. Neither field should appear in template inputs — they are not available as action input parameters.

## Actions

### `sonarcloud:project:create`

Creates a new project in SonarCloud.

#### Input

| Field        | Type                    | Required | Default     | Description                                |
| ------------ | ----------------------- | -------- | ----------- | ------------------------------------------ |
| `name`       | `string`                | Yes      | --          | Human-readable project display name        |
| `key`        | `string`                | Yes      | --          | Unique project key within the organization |
| `visibility` | `'public' \| 'private'` | No       | Org default | Project visibility level                   |

#### Output

| Field        | Type     | Description                                                |
| ------------ | -------- | ---------------------------------------------------------- |
| `projectKey` | `string` | The key assigned to the created project                    |
| `projectId`  | `string` | Internal project UUID (needed by `sonarcloud:project:bind`) |
| `projectUrl` | `string` | Direct URL to the project overview in SonarCloud           |

#### Example

```yaml
steps:
  - id: sonarcloudCreate
    action: sonarcloud:project:create
    name: Create SonarCloud Project
    input:
      name: My Service
      key: my-org_my-service
      visibility: private
```

---

### `sonarcloud:project:bind`

Binds a SonarCloud project to an ALM (Application Lifecycle Management) repository. This enables automatic analysis of pull requests and branch tracking.

#### Input

| Field          | Type     | Required | Description                                            |
| -------------- | -------- | -------- | ------------------------------------------------------ |
| `projectId`    | `string` | Yes      | SonarCloud project UUID                                |
| `projectKey`   | `string` | Yes      | SonarCloud project key (for building project URL)      |
| `repositoryId` | `string` | Yes      | Repository as `owner/repo` (e.g., `my-org/my-service`) |

#### Output

| Field          | Type     | Description                            |
| -------------- | -------- | -------------------------------------- |
| `repositoryId` | `string` | The repository that was bound          |
| `projectUrl`   | `string` | URL to the SonarCloud project overview |

#### Example

```yaml
steps:
  - id: sonarcloudBind
    action: sonarcloud:project:bind
    name: Bind SonarCloud to GitHub
    input:
      projectId: ${{ steps['sonarcloudCreate'].output.projectId }}
      projectKey: ${{ steps['sonarcloudCreate'].output.projectKey }}
      repositoryId: my-org/my-service
```

---

### `sonarcloud:defaultBranch:rename`

Renames the default branch tracked by SonarCloud. SonarCloud initially names the default branch `main`, so use this action when your repository uses a different convention (e.g., `develop`, `trunk`).

#### Input

| Field        | Type     | Required | Default | Description                   |
| ------------ | -------- | -------- | ------- | ----------------------------- |
| `projectKey` | `string` | Yes      | --      | SonarCloud project key        |
| `name`       | `string` | No       | `main`  | Branch name to set as default |

#### Output

| Field        | Type     | Description                             |
| ------------ | -------- | --------------------------------------- |
| `branchName` | `string` | The branch name that was set as default |

#### Example

```yaml
steps:
  - id: sonarcloudBranch
    action: sonarcloud:defaultBranch:rename
    name: Set Default Branch
    input:
      projectKey: ${{ steps['sonarcloudCreate'].output.projectKey }}
```

> **Note**: When omitted, `name` defaults to `main`. Only include it if your repository uses a different default branch.

---

### `sonarcloud:qualityGate:assign`

Assigns a quality gate to a SonarCloud project. The gate is resolved by **name** -- the action looks up the numeric ID automatically.

#### Input

| Field             | Type     | Required | Description                                         |
| ----------------- | -------- | -------- | --------------------------------------------------- |
| `projectKey`      | `string` | Yes      | SonarCloud project key                              |
| `qualityGateName` | `string` | Yes      | Name of the quality gate to assign (case-sensitive) |

#### Output

| Field             | Type     | Description                             |
| ----------------- | -------- | --------------------------------------- |
| `qualityGateId`   | `number` | Numeric ID of the assigned quality gate |
| `qualityGateName` | `string` | Name of the assigned quality gate       |

#### Example

```yaml
steps:
  - id: sonarcloudGate
    action: sonarcloud:qualityGate:assign
    name: Set Quality Gate
    input:
      projectKey: ${{ steps['sonarcloudCreate'].output.projectKey }}
      qualityGateName: Sonar way
```

> **Note**: Quality gate names are **case-sensitive**. Check the exact name in SonarCloud > Quality Gates.

---

### `sonarcloud:newCodeDefinition:set`

Configures the new code period boundary for a SonarCloud project. This determines what SonarCloud considers "new code" for quality gate evaluation.

#### Input

| Field        | Type                                                           | Required    | Default | Description                                                                                                   |
| ------------ | -------------------------------------------------------------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `projectKey` | `string`                                                       | Yes         | --      | SonarCloud project key                                                                                        |
| `type`       | `'previous_version' \| 'number_of_days' \| 'reference_branch'` | Yes         | --      | New code definition strategy                                                                                  |
| `value`      | `string`                                                       | Conditional | --      | Required for `number_of_days` (integer) and `reference_branch` (branch name). Omitted for `previous_version`. |

#### Output

| Field   | Type                | Description                                             |
| ------- | ------------------- | ------------------------------------------------------- |
| `type`  | `string`            | The new code definition type that was set               |
| `value` | `string` (optional) | The value set. Omitted when type is `previous_version`. |

#### Example -- previous version

```yaml
steps:
  - id: sonarcloudNewcode
    action: sonarcloud:newCodeDefinition:set
    name: Set New Code Definition
    input:
      projectKey: ${{ steps['sonarcloudCreate'].output.projectKey }}
      type: previous_version
```

#### Example -- number of days

```yaml
steps:
  - id: sonarcloudNewcode
    action: sonarcloud:newCodeDefinition:set
    name: Set New Code Definition (30 days)
    input:
      projectKey: ${{ steps['sonarcloudCreate'].output.projectKey }}
      type: number_of_days
      value: '30'
```

## Examples

See the [`examples/`](./examples/) directory for usage templates, including a minimal project creation template.

### Action ordering

`sonarcloud:project:create` **must run first** — all other actions reference the project key and ID it outputs. After that, the remaining four actions can run in any order. All actions except `createProject` are optional.

## Troubleshooting

**401 Unauthorized**
Token lacks permissions or has expired. Generate a new token at [sonarcloud.io > My Account > Security](https://sonarcloud.io/account/security). The token must have `Administer` permission on the target organization.

**Organization not found (404)**
Verify that the `organizationName` value in app-config matches the SonarCloud organization key exactly (lowercase, hyphens allowed). You can find it in the URL: `sonarcloud.io/organizations/<org-key>`.

**Branch rename fails**
The project may not exist yet in SonarCloud. Ensure `sonarcloud:project:create` runs before `sonarcloud:defaultBranch:rename`.

**Quality gate not found**
Gate names are case-sensitive. If the action fails, the error message lists all available gates in the organization. Check the exact name at SonarCloud > Quality Gates.

**Rate limiting (429)**
The plugin automatically retries on 429 responses with exponential backoff (1s, 2s, 4s). If retries are exhausted, the original 429 error is re-thrown. This typically only occurs during bulk provisioning.

**Request timeout**
Each API call has a 30-second timeout. A `SonarCloudTimeoutError` indicates the SonarCloud API is slow or unreachable. Check [SonarCloud status](https://sonarcloud.statuspage.io/).

**Manual deprovisioning**
To remove a SonarCloud project, go to SonarCloud > Project Settings > Deletion. This plugin does not provide a delete action.

## Links

- [SonarCloud API documentation](https://sonarcloud.io/web_api)
- [Backstage Scaffolder documentation](https://backstage.io/docs/features/software-templates/)
- [Example templates](./examples/)
