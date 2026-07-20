# Contributing — Regex scaffolder backend module

Developer guide for `@backstage-community/plugin-scaffolder-backend-module-regex`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock`; run commands from `workspaces/scaffolder-backend-module-regex/`)

## Development harness

Start this module in isolation:

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-regex start
```

This runs a minimal backend with `@backstage/plugin-scaffolder-backend` and the regex module. Use it to verify action registration and local scaffolder integration work.

The harness listens on port **7007**. Only one plugin `dev/` harness should run on that port at a time.

### Environment setup

Export this variable in your shell before starting the harness. Use a local-only placeholder value for development — do not commit secrets.

| Variable                     | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls to the dev backend |

Config keys are defined in [`app-config.yaml`](./app-config.yaml). You may override them in an untracked `app-config.local.yaml` beside the package if your local Backstage CLI setup supports it.

### API authentication for `curl`

The dev [`app-config.yaml`](./app-config.yaml) registers a **static** backend access token (see [service-to-service auth](https://backstage.io/docs/auth/service-to-service-auth)):

```yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${BACKSTAGE_DEV_STATIC_TOKEN}
          subject: user:default/guest
```

Authenticated scaffolder API requests must send that token:

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/scaffolder/v2/actions"
```

Requests without a valid `Authorization: Bearer …` header are rejected when the default auth policy applies.

## Validation commands

From the workspace root (`workspaces/scaffolder-backend-module-regex`):

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-regex test
yarn workspace @backstage-community/plugin-scaffolder-backend-module-regex lint:check
yarn tsc
```

## What automated tests cover

CI exercises:

- **Module wiring** — scaffolder extension-point registration of the `regex:replace` action
- **Schema validation** — the `pattern` Zod `refine` rule (rejects patterns with a leading and/or trailing forward slash), invoked directly against the schema rather than through the action handler
- **Action handler** — `String.prototype.replace()` / `replaceAll()`-style substitutions and the duplicate-key error path

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change scaffolder integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness.
2. List registered scaffolder actions (requires Bearer token):

   ```bash
   curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/scaffolder/v2/actions"
   ```

   Expect the `regex:replace` action ID in the response.

3. End-to-end template execution (running a software template through the UI or a full consumer Backstage app) is not covered by this harness alone.

## Related packages

- [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend) — host scaffolder backend plugin for this module
