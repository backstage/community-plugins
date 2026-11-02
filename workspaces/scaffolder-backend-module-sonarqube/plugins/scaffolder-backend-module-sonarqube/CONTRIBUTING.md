# Contributing — SonarQube scaffolder backend module

Developer guide for `@backstage-community/plugin-scaffolder-backend-module-sonarqube`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock`; run commands from `workspaces/scaffolder-backend-module-sonarqube/`)

## Development harness

Start this module in isolation with the package’s minimal harness config:

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-sonarqube start \
  --config app-config.yaml
```

(`--config` paths are resolved from the plugins directory.)

This runs a minimal backend with `@backstage/plugin-scaffolder-backend` and the SonarQube module. Use it to verify action registration and local scaffolder integration work.

The harness listens on port **7007**. Only one plugin `dev/` harness should run on that port at a time.

### Environment setup

Export this variable in your shell before starting the harness. Use a local-only placeholder value for development — do not commit secrets. The token must be at least **8 characters**.

| Variable                     | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls to the dev backend |

[`app-config.yaml`](./app-config.yaml) in this package is the **minimal** config required to run the dev harness (listen port and static auth). Prefer starting with `--config app-config.yaml` as shown above.

By default (without `--config`), `yarn start` loads the fuller [`../../app-config.yaml`](../../app-config.yaml) from the workspace root instead. That file is for a broader local Backstage app setup and is not required for this harness. Optional overrides can go in an untracked `app-config.local.yaml` next to whichever config file you pass (or at the workspace root when relying on the default).

### API authentication for `curl`

The harness [`app-config.yaml`](./app-config.yaml) registers a **static** backend access token (see [service-to-service auth](https://backstage.io/docs/auth/service-to-service-auth)):

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

From the workspace root (`workspaces/scaffolder-backend-module-sonarqube`):

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-sonarqube test
yarn workspace @backstage-community/plugin-scaffolder-backend-module-sonarqube lint:check
yarn tsc
```

## What automated tests cover

CI exercises:

- **Module wiring** — scaffolder extension-point registration of the `sonarqube:create-project` action
- **Action handler** — fetch contract for creating a SonarQube project (`POST` to `/api/projects/create`), success-path `projectUrl` output, and common error / validation paths

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change scaffolder integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness.
2. List registered scaffolder actions (requires Bearer token):

   ```bash
   curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/scaffolder/v2/actions"
   ```

   Expect the `sonarqube:create-project` action ID in the response.

3. End-to-end template execution (running a software template through the UI or a full consumer Backstage app) is not covered by this harness alone. If you need a SonarQube instance for that kind of testing, use the official SonarQube [container image](https://hub.docker.com/_/sonarqube/) with [Podman](https://podman.io/) or [Docker](https://docker.io/), or the sample Docker Compose setup from the [SonarQube docs](https://docs.sonarqube.org/latest/setup-and-upgrade/install-the-server/#installing-sonarqube-from-the-docker-image).

## Related packages

- [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend) — host scaffolder backend plugin for this module
