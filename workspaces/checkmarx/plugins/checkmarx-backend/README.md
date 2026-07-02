# Checkmarx Backend Plugin

This backend plugin resolves Checkmarx One data for a Backstage catalog entity by:

1. reading `checkmarx.org/project-id` and `checkmarx.org/default-branch`
2. exchanging the configured API key for an IAM access token
3. fetching the latest completed scan for the entity
4. fetching `scan-summary`
5. returning a normalized summary to the frontend plugin

## Installation

```bash
yarn --cwd packages/backend add @backstage-community/plugin-checkmarx-backend
```

Add the plugin to `packages/backend/src/index.ts`:

```ts
backend.add(import('@backstage-community/plugin-checkmarx-backend'));
```

## Minimal Configuration

Add this to `app-config.yaml` or `app-config.local.yaml`:

```yaml
checkmarx:
  location: US2
  tenant: ${CHECKMARX_TENANT}
  apiKey: ${CHECKMARX_API_KEY}
```

## Configuration Reference

| Key                            | Required | Secret | Description                                                          |
| ------------------------------ | -------- | ------ | -------------------------------------------------------------------- |
| `checkmarx.location`           | Yes      | No     | Checkmarx One region code used to resolve the AST and IAM base URLs. |
| `checkmarx.tenant`             | Yes      | No     | Tenant name used in the IAM token exchange.                          |
| `checkmarx.apiKey`             | Yes      | Yes    | Checkmarx API key / refresh token used to request an access token.   |
| `checkmarx.externalBaseUrl`    | No       | No     | UI base URL used to build links back to Checkmarx from Backstage.    |
| `checkmarx.astBaseUrlOverride` | No       | No     | Optional override for the AST API base URL.                          |
| `checkmarx.iamBaseUrlOverride` | No       | No     | Optional override for the IAM base URL.                              |

## Environment Variables and Secrets

These are the values you typically configure in your deployment platform:

| Environment Variable | Required | Secret | Example      | Used For                                                 |
| -------------------- | -------- | ------ | ------------ | -------------------------------------------------------- |
| `CHECKMARX_TENANT`   | Yes      | No     | `my-company` | Tenant name inside Checkmarx One IAM.                    |
| `CHECKMARX_API_KEY`  | Yes      | Yes    | `******`     | Refresh token / API key used to obtain the bearer token. |

Example:

```yaml
checkmarx:
  location: US2
  tenant: ${CHECKMARX_TENANT}
  apiKey: ${CHECKMARX_API_KEY}
  externalBaseUrl: https://us.ast.checkmarx.net
```

## Supported Regions

As of May 27, 2026, these region codes are hardcoded in the plugin:

| `location` | Region / Country             | AST Base URL                     | IAM Base URL                     |
| ---------- | ---------------------------- | -------------------------------- | -------------------------------- |
| `US`       | United States                | `https://ast.checkmarx.net`      | `https://iam.checkmarx.net`      |
| `US2`      | United States 2              | `https://us.ast.checkmarx.net`   | `https://us.iam.checkmarx.net`   |
| `EU`       | Europe                       | `https://eu.ast.checkmarx.net`   | `https://eu.iam.checkmarx.net`   |
| `EU2`      | Europe 2                     | `https://eu-2.ast.checkmarx.net` | `https://eu-2.iam.checkmarx.net` |
| `DEU`      | Germany                      | `https://deu.ast.checkmarx.net`  | `https://deu.iam.checkmarx.net`  |
| `ANZ`      | Australia and New Zealand    | `https://anz.ast.checkmarx.net`  | `https://anz.iam.checkmarx.net`  |
| `IND`      | India                        | `https://ind.ast.checkmarx.net`  | `https://ind.iam.checkmarx.net`  |
| `SNG`      | Singapore                    | `https://sng.ast.checkmarx.net`  | `https://sng.iam.checkmarx.net`  |
| `MEA`      | UAE / Middle East and Africa | `https://mea.ast.checkmarx.net`  | `https://mea.iam.checkmarx.net`  |

## Custom Regions

If your Checkmarx tenant is hosted in a region that is not hardcoded in the plugin, set both overrides explicitly.

Example for a custom region:

```yaml
checkmarx:
  location: CUSTOM
  tenant: ${CHECKMARX_TENANT}
  apiKey: ${CHECKMARX_API_KEY}
  externalBaseUrl: https://custom.ast.checkmarx.net
  astBaseUrlOverride: https://custom.ast.checkmarx.net
  iamBaseUrlOverride: https://custom.iam.checkmarx.net
```

The plugin accepts custom base URLs as long as both override values are provided.

## Catalog Annotations

Add these annotations to each entity that should display Checkmarx data:

```yaml
metadata:
  annotations:
    checkmarx.org/project-id: 1491e6f9-0411-4b88-8271-d93d120d05df
    checkmarx.org/default-branch: main # optional
```

Notes:

- `checkmarx.org/project-id` is required.
- `checkmarx.org/default-branch` is optional.
- If `checkmarx.org/default-branch` is not set, the backend searches for the latest completed scan in `main` and then `master`.

## API

The plugin exposes:

```text
GET /api/checkmarx/entities/:kind/:namespace/:name/summary
```

The response contains normalized counters and dashboard metrics for the latest completed scan.

## Troubleshooting

| Problem                            | Likely Cause                                     | What To Check                                                         |
| ---------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| `401 Unauthorized`                 | Invalid or expired credentials                   | Verify `CHECKMARX_API_KEY` and `CHECKMARX_TENANT`.                    |
| `403 Forbidden`                    | Token is valid but lacks access                  | Verify the Checkmarx project permissions for the configured tenant.   |
| `404 No completed scan`            | No completed scan exists for that project/branch | Verify `checkmarx.org/project-id` and `checkmarx.org/default-branch`. |
| Wrong link back to Checkmarx       | UI URL differs from API URL                      | Set `checkmarx.externalBaseUrl`.                                      |
| Region not supported by `location` | Tenant is hosted in another environment          | Set both `astBaseUrlOverride` and `iamBaseUrlOverride`.               |

## Links

- [Frontend plugin](../checkmarx/README.md)
- [Checkmarx official website](https://checkmarx.com/)
- [Checkmarx One login base URLs](https://docs.checkmarx.com/en/34965-68530-logging-in-to-checkmarx-one.html)
