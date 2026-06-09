# @backstage-community/plugin-akeyless-backend

Backend plugin that authenticates to Akeyless and exposes a list-only API for the frontend.

## Installation

```bash
yarn --cwd packages/backend add @backstage-community/plugin-akeyless-backend
```

```typescript
// packages/backend/src/index.ts
backend.add(import('@backstage-community/plugin-akeyless-backend'));
```

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

| Endpoint                                    | Description                              |
| ------------------------------------------- | ---------------------------------------- |
| `GET /api/akeyless/health`                  | Health check (`allowCrud` flag included) |
| `GET /api/akeyless/v1/secrets/:path`        | List items under path                    |
| `GET /api/akeyless/v1/static-secrets/value` | Read a static secret value               |
| `POST /api/akeyless/v1/static-secrets`      | Create a static secret                   |
| `PUT /api/akeyless/v1/static-secrets`       | Update a static secret value             |
| `DELETE /api/akeyless/v1/static-secrets`    | Delete a static secret                   |

Optional query param on list: `types` (repeatable) to filter item types.

CRUD routes require `akeyless.allowCrud: true` in `app-config.yaml` (default). Each request must include `contextPath` (body or query) matching the entity's annotated path; the backend rejects paths outside that scope.

### Disable CRUD

```yaml
akeyless:
  allowCrud: false
```

Or per entity:

```yaml
metadata:
  annotations:
    akeyless.io/allow-crud: 'false'
```
