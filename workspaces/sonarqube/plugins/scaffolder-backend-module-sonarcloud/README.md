# @backstage-community/plugin-scaffolder-backend-module-sonarcloud

Backstage scaffolder backend module providing actions for SonarCloud project onboarding.

## What it does

Five scaffolder actions that automate the full SonarCloud project onboarding flow within Backstage Software Templates:

| Action                            | Purpose                                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| `sonarcloud:createProject`        | Creates a new project in SonarCloud                                        |
| `sonarcloud:bindProject`          | Binds a project to a GitHub, GitLab, Bitbucket, or Azure DevOps repository |
| `sonarcloud:setDefaultBranch`     | Renames the default branch tracked by SonarCloud                           |
| `sonarcloud:setQualityGate`       | Assigns a quality gate to the project (by name)                            |
| `sonarcloud:setNewCodeDefinition` | Configures the new code period boundary                                    |

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

This plugin does **not** require any `app-config.yaml` entries. Authentication is handled per-action via the `token` input field.

**Recommended approach**: use Backstage secrets so tokens are not hardcoded in templates:

```yaml
input:
  token: ${{ secrets.SONARCLOUD_TOKEN }}
```

Your platform team provisions the `SONARCLOUD_TOKEN` secret in Backstage. Template authors reference it without ever seeing the raw value.

## Actions

### `sonarcloud:createProject`

Creates a new project in SonarCloud.

#### Input

| Field          | Type                    | Required | Default     | Description                                |
| -------------- | ----------------------- | -------- | ----------- | ------------------------------------------ |
| `organization` | `string`                | Yes      | --          | SonarCloud organization key                |
| `name`         | `string`                | Yes      | --          | Human-readable project display name        |
| `key`          | `string`                | Yes      | --          | Unique project key within the organization |
| `visibility`   | `'public' \| 'private'` | No       | Org default | Project visibility level                   |
| `token`        | `string`                | Yes      | --          | SonarCloud API token                       |

#### Output

| Field        | Type     | Description                                                |
| ------------ | -------- | ---------------------------------------------------------- |
| `projectKey` | `string` | The key assigned to the created project                    |
| `projectId`  | `string` | Internal project UUID (needed by `sonarcloud:bindProject`) |
| `projectUrl` | `string` | Direct URL to the project overview in SonarCloud           |

#### Example

```yaml
steps:
  - id: sonarcloud-create
    action: sonarcloud:createProject
    name: Create SonarCloud Project
    input:
      organization: my-org
      name: My Service
      key: my-org_my-service
      visibility: private
      token: ${{ secrets.SONARCLOUD_TOKEN }}
```

---

### `sonarcloud:bindProject`

Binds a SonarCloud project to an ALM (Application Lifecycle Management) repository. This enables automatic analysis of pull requests and branch tracking.

#### Input

| Field          | Type     | Required | Default    | Description                                            |
| -------------- | -------- | -------- | ---------- | ------------------------------------------------------ |
| `projectId`    | `string` | Yes      | --         | SonarCloud project UUID from `create-project` output   |
| `projectKey`   | `string` | Yes      | --         | SonarCloud project key (for building project URL)      |
| `repositoryId` | `string` | Yes      | --         | Repository as `owner/repo` (e.g., `my-org/my-service`) |
| `token`        | `string` | No       | app-config | SonarCloud API token                                   |

#### Output

| Field          | Type     | Description                            |
| -------------- | -------- | -------------------------------------- |
| `repositoryId` | `string` | The repository that was bound          |
| `projectUrl`   | `string` | URL to the SonarCloud project overview |

#### Example

```yaml
steps:
  - id: sonarcloud-bind
    action: sonarcloud:bindProject
    name: Bind SonarCloud to GitHub
    input:
      projectId: ${{ steps['sonarcloud-create'].output.projectId }}
      projectKey: ${{ steps['sonarcloud-create'].output.projectKey }}
      repositoryId: my-org/my-service
```

---

### `sonarcloud:setDefaultBranch`

Renames the default branch tracked by SonarCloud. SonarCloud initially names the default branch `main`, so use this action when your repository uses a different convention (e.g., `develop`, `trunk`).

#### Input

| Field        | Type     | Required | Default | Description                   |
| ------------ | -------- | -------- | ------- | ----------------------------- |
| `projectKey` | `string` | Yes      | --      | SonarCloud project key        |
| `name`       | `string` | No       | `main`  | Branch name to set as default |
| `token`      | `string` | Yes      | --      | SonarCloud API token          |

#### Output

| Field        | Type     | Description                             |
| ------------ | -------- | --------------------------------------- |
| `branchName` | `string` | The branch name that was set as default |

#### Example

```yaml
steps:
  - id: sonarcloud-branch
    action: sonarcloud:setDefaultBranch
    name: Set Default Branch
    input:
      projectKey: ${{ steps['sonarcloud-create'].output.projectKey }}
      token: ${{ secrets.SONARCLOUD_TOKEN }}
```

> **Note**: When omitted, `name` defaults to `main`. Only include it if your repository uses a different default branch.

---

### `sonarcloud:setQualityGate`

Assigns a quality gate to a SonarCloud project. The gate is resolved by **name** -- the action looks up the numeric ID automatically.

#### Input

| Field             | Type     | Required | Default | Description                                         |
| ----------------- | -------- | -------- | ------- | --------------------------------------------------- |
| `projectKey`      | `string` | Yes      | --      | SonarCloud project key                              |
| `qualityGateName` | `string` | Yes      | --      | Name of the quality gate to assign (case-sensitive) |
| `organization`    | `string` | Yes      | --      | SonarCloud organization key                         |
| `token`           | `string` | Yes      | --      | SonarCloud API token                                |

#### Output

| Field             | Type     | Description                             |
| ----------------- | -------- | --------------------------------------- |
| `qualityGateId`   | `number` | Numeric ID of the assigned quality gate |
| `qualityGateName` | `string` | Name of the assigned quality gate       |

#### Example

```yaml
steps:
  - id: sonarcloud-gate
    action: sonarcloud:setQualityGate
    name: Set Quality Gate
    input:
      projectKey: ${{ steps['sonarcloud-create'].output.projectKey }}
      qualityGateName: Sonar way
      organization: my-org
      token: ${{ secrets.SONARCLOUD_TOKEN }}
```

> **Note**: Quality gate names are **case-sensitive**. Check the exact name in SonarCloud > Quality Gates.

---

### `sonarcloud:setNewCodeDefinition`

Configures the new code period boundary for a SonarCloud project. This determines what SonarCloud considers "new code" for quality gate evaluation.

#### Input

| Field        | Type                                                           | Required    | Default | Description                                                                                                   |
| ------------ | -------------------------------------------------------------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `projectKey` | `string`                                                       | Yes         | --      | SonarCloud project key                                                                                        |
| `type`       | `'previous_version' \| 'number_of_days' \| 'reference_branch'` | Yes         | --      | New code definition strategy                                                                                  |
| `value`      | `string`                                                       | Conditional | --      | Required for `number_of_days` (integer) and `reference_branch` (branch name). Omitted for `previous_version`. |
| `token`      | `string`                                                       | Yes         | --      | SonarCloud API token                                                                                          |

#### Output

| Field   | Type                | Description                                             |
| ------- | ------------------- | ------------------------------------------------------- |
| `type`  | `string`            | The new code definition type that was set               |
| `value` | `string` (optional) | The value set. Omitted when type is `previous_version`. |

#### Example -- previous version

```yaml
steps:
  - id: sonarcloud-newcode
    action: sonarcloud:setNewCodeDefinition
    name: Set New Code Definition
    input:
      projectKey: ${{ steps['sonarcloud-create'].output.projectKey }}
      type: previous_version
      token: ${{ secrets.SONARCLOUD_TOKEN }}
```

#### Example -- number of days

```yaml
steps:
  - id: sonarcloud-newcode
    action: sonarcloud:setNewCodeDefinition
    name: Set New Code Definition (30 days)
    input:
      projectKey: ${{ steps['sonarcloud-create'].output.projectKey }}
      type: number_of_days
      value: '30'
      token: ${{ secrets.SONARCLOUD_TOKEN }}
```

## Examples

See the [`examples/`](./examples/) directory for usage templates, including a minimal project creation template.

### Action ordering

`sonarcloud:createProject` **must run first** — all other actions reference the project key and ID it outputs. After that, the remaining four actions can run in any order. All actions except `createProject` are optional.

## Troubleshooting

**401 Unauthorized**
Token lacks permissions or has expired. Generate a new token at [sonarcloud.io > My Account > Security](https://sonarcloud.io/account/security). The token must have `Administer` permission on the target organization.

**Organization not found (404)**
Verify that the `organization` value matches the SonarCloud organization key exactly (lowercase, hyphens allowed). You can find it in the URL: `sonarcloud.io/organizations/<org-key>`.

**ALM setting not found**
The `almSetting` value must match the integration name configured in SonarCloud, not the platform name. Verify at SonarCloud > Administration > ALM Integrations. Common mistake: using `"github"` instead of the actual integration name like `"My GitHub App"`.

**Branch rename fails**
The project may not exist yet in SonarCloud. Ensure `sonarcloud:createProject` runs before `sonarcloud:setDefaultBranch`.

**Quality gate not found**
Gate names are case-sensitive. If the action fails, the error message lists all available gates in the organization. Check the exact name at SonarCloud > Quality Gates.

**Rate limiting (429)**
The plugin automatically retries on 429 responses with exponential backoff (1s, 2s, 4s). If retries are exhausted, a `SonarCloudRateLimitError` is thrown. This typically only occurs during bulk provisioning.

**Request timeout**
Each API call has a 30-second timeout. A `SonarCloudTimeoutError` indicates the SonarCloud API is slow or unreachable. Check [SonarCloud status](https://sonarcloud.statuspage.io/).

**Manual deprovisioning**
To remove a SonarCloud project, go to SonarCloud > Project Settings > Deletion. This plugin does not provide a delete action.

## Links

- [SonarCloud API documentation](https://sonarcloud.io/web_api)
- [Backstage Scaffolder documentation](https://backstage.io/docs/features/software-templates/)
- [Example templates](./examples/)
