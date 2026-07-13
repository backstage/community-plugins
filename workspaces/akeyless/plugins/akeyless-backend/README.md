# @backstage-community/plugin-akeyless-backend

Backend plugin that authenticates to Akeyless and exposes list and static-secret CRUD APIs for the [@backstage-community/plugin-akeyless](../akeyless/README.md) frontend.

## Introduction

This plugin:

- Authenticates to Akeyless using access key, Universal Identity (UID), or cloud IAM
- Lists items under a given path (recursive folder traversal)
- Optionally exposes CRUD endpoints for static secrets, scoped to a `contextPath` that must match the catalog entity's annotated path

When `akeyless` configuration is missing, the plugin still mounts a `/health` endpoint that reports `{ "status": "disabled", "reason": "missing config" }` to simplify troubleshooting.

## Installation

```bash
yarn --cwd packages/backend add @backstage-community/plugin-akeyless-backend
```

```typescript
// packages/backend/src/index.ts
backend.add(import('@backstage-community/plugin-akeyless-backend'));
```

Install the [frontend plugin](../akeyless/README.md) to consume these APIs from the UI.

## Configuration reference

| Key                                                  | Required       | Default                       | Description                                                                                              |
| ---------------------------------------------------- | -------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `akeyless.deploymentProfile`                         | No             | `saas`                        | `saas`, `onprem`, or `cloud` — controls valid auth methods                                               |
| `akeyless.gatewayUrl`                                | No             | `https://api.akeyless.io`     | Akeyless API gateway URL                                                                                 |
| `akeyless.consoleUrl`                                | No             | `https://console.akeyless.io` | Base URL for Console deep links                                                                          |
| `akeyless.allowCrud`                                 | No             | `true`                        | When `false`, only list endpoints are active                                                             |
| `akeyless.authentication.method`                     | No             | inferred                      | `accessKey`, `universalIdentity`, or `cloudIam`. Inferred from configured credential fields when omitted |
| `akeyless.authentication.accessKey.accessId`         | For access key | —                             | Akeyless access ID                                                                                       |
| `akeyless.authentication.accessKey.accessKey`        | For access key | —                             | Akeyless access key                                                                                      |
| `akeyless.authentication.universalIdentity.uidToken` | For UID        | —                             | Universal Identity token                                                                                 |
| `akeyless.authentication.cloudIam.accessId`          | For cloud IAM  | —                             | Akeyless access ID                                                                                       |
| `akeyless.authentication.cloudIam.provider`          | For cloud IAM  | —                             | `aws_iam`, `azure_ad`, or `gcp`                                                                          |

When the `akeyless` block is present, the matching credential fields for the active auth method are required (for example access ID/key for access key auth).

### Deployment profiles and auth methods

| Profile  | Supported `authentication.method` values |
| -------- | ---------------------------------------- |
| `saas`   | `accessKey`                              |
| `onprem` | `accessKey`, `universalIdentity`         |
| `cloud`  | `accessKey`, `cloudIam`                  |

## Configuration examples

### SaaS (access key)

```yaml
akeyless:
  deploymentProfile: saas
  gatewayUrl: https://api.akeyless.io
  consoleUrl: https://console.akeyless.io
  authentication:
    method: accessKey
    accessKey:
      accessId: ${AKEYLESS_ACCESS_ID}
      accessKey: ${AKEYLESS_ACCESS_KEY}
```

### On-prem (access key or UID)

```yaml
akeyless:
  deploymentProfile: onprem
  gatewayUrl: https://gateway.company.com:8080/v2
  consoleUrl: https://console.company.com
  authentication:
    method: universalIdentity
    universalIdentity:
      uidToken: ${AKEYLESS_UID_TOKEN}
```

### Cloud (IAM)

Run Backstage on AWS, Azure, or GCP and use cloud identity:

```yaml
akeyless:
  deploymentProfile: cloud
  gatewayUrl: https://api.akeyless.io
  authentication:
    method: cloudIam
    cloudIam:
      accessId: ${AKEYLESS_ACCESS_ID}
      provider: aws_iam # aws_iam | azure_ad | gcp
```

### Self-hosted gateway

Point `gatewayUrl` at your gateway (port 8080 with `/v2` or port 8081 without prefix per your deployment).

## API

All routes are prefixed with `/api/akeyless`.

| Endpoint                       | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| `GET /health`                  | Health check; includes `allowCrud` when configured              |
| `GET /v1/secrets/:path`        | List items under path                                           |
| `GET /v1/static-secrets/value` | Read a static secret value (`name`, `contextPath` query params) |
| `POST /v1/static-secrets`      | Create a static secret (`name`, `value`, `contextPath` in body) |
| `PUT /v1/static-secrets`       | Update a static secret value                                    |
| `DELETE /v1/static-secrets`    | Delete a static secret                                          |

Optional query param on list: `types` (repeatable) to filter item types.

### Path scoping

CRUD routes require `contextPath` in the request body or query. The backend normalizes paths and rejects any operation where the target secret is outside the `contextPath` scope. This aligns with the catalog annotation `akeyless.io/secrets-path` used by the frontend.

### Disable CRUD

Globally:

```yaml
akeyless:
  allowCrud: false
```

Per entity (frontend hides controls; backend still enforces global setting):

```yaml
metadata:
  annotations:
    akeyless.io/allow-crud: 'false'
```

When CRUD is disabled, CRUD endpoints return `403 Not Allowed`.

## Permissions

Grant the configured Akeyless credential only what Backstage needs:

| Operation                               | Akeyless capability                          |
| --------------------------------------- | -------------------------------------------- |
| List items                              | Read/list on annotated paths                 |
| Read static secret value                | Read on target static secrets                |
| Create / update / delete static secrets | Create, update, delete on paths within scope |

The credential is shared across all Backstage users who can reach the plugin UI.

## Health check

```bash
curl http://localhost:7007/api/akeyless/health
```

Configured and healthy:

```json
{ "status": "ok", "allowCrud": true }
```

Missing configuration:

```json
{ "status": "disabled", "reason": "missing config" }
```

## Troubleshooting

| Symptom                               | What to check                                              |
| ------------------------------------- | ---------------------------------------------------------- |
| `status: disabled` on `/health`       | Add the `akeyless` block to `app-config.yaml`              |
| Authentication errors in backend logs | Verify `gatewayUrl`, access ID/key, or UID/IAM setup       |
| `403` on CRUD                         | `allowCrud: false` globally, or path outside `contextPath` |
| Empty list                            | Path does not exist, or credential lacks list permission   |
| Wrong Console links                   | Set `consoleUrl` to match your Akeyless Console deployment |

## Related documentation

- [Frontend plugin README](../akeyless/README.md) — UI setup and catalog annotations
- [Workspace README](../../README.md) — end-to-end quick start
