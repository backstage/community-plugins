# Contributing — Scaffolder relation catalog processor module

Developer guide for `@backstage-community/plugin-catalog-backend-module-scaffolder-relation-processor`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock`; run commands from `workspaces/scaffolder-relation-processor/`)

## Development harness

Start this module in isolation with the package’s minimal harness config:

```bash
yarn workspace @backstage-community/plugin-catalog-backend-module-scaffolder-relation-processor start \
  --config app-config.yaml
```

(`--config` paths are resolved from the plugins directory.)

This runs a minimal backend with `@backstage/plugin-catalog-backend` and the scaffolder relation processor module (`dev/index.ts`). Use it to verify catalog processor registration, example entity ingestion, and relation emission on a Component with `spec.scaffoldedFrom`.

The harness listens on port **7007**. Only one plugin `dev/` harness should run on that port at a time.

### Environment setup

Export this variable in your shell before starting the harness. Use a local-only placeholder value for development — do not commit secrets. The token must be at least **8 characters**.

| Variable                     | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls to the dev backend |

[`app-config.yaml`](./app-config.yaml) in this package is the config required to run the `dev/` harness (listen port, static auth, catalog debug logging, and example catalog locations under [`examples/`](./examples)). Prefer starting with `--config app-config.yaml` as shown above.

Optional overrides can go in an untracked `app-config.local.yaml` next to the package config file if your local Backstage CLI setup supports it.

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

Authenticated catalog API requests must send that token:

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/catalog/entities"
```

Requests without a valid `Authorization: Bearer …` header are rejected when the default auth policy applies.

## Validation commands

From the workspace root (`workspaces/scaffolder-relation-processor`):

```bash
yarn workspace @backstage-community/plugin-catalog-backend-module-scaffolder-relation-processor test
yarn workspace @backstage-community/plugin-catalog-backend-module-scaffolder-relation-processor lint
yarn tsc
```

## What automated tests cover

CI exercises:

- **Module wiring** — catalog processing extension-point registration of `ScaffolderRelationEntityProcessor`, including safe zero-config init
- **Processor contract** — `ScaffolderRelationEntityProcessor` pre/post-process behavior for representative entity cases
- **Config / template-update helpers** — `readScaffolderRelationProcessorConfig` and related template version utilities
- **Pull-request subunits** — VCS provider, comparison, and template helper unit tests under `pullRequests/**`

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change catalog integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness.
2. Confirm the module loaded by checking startup logs. The harness [`app-config.yaml`](./app-config.yaml) enables `debug` for the catalog plugin so these lines appear on boot:

   ```text
   catalog debug Registering the scaffolder-relation-processor catalog module
   catalog debug Registered VCS providers: github, gitlab
   ```

   If you override logging elsewhere, set catalog debug the same way (`backend.logger.overrides` matching `plugin: catalog`, or `LOG_LEVEL=debug`).

3. Confirm the backend boots without errors and the example entities are ingested (requires Bearer token). Wait a few seconds for catalog processing, then:

   ```bash
   curl -s -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/catalog/entities?fields=kind,metadata.name,spec.scaffoldedFrom,relations"
   ```

   Expect at least `Component` `example-website` and `User` `guest`.

4. Confirm the processor emitted a `scaffoldedFrom` relation on the component (not just that the module loaded):

   ```bash
   curl -s -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/catalog/entities/by-name/component/default/example-website" \
     | jq '.relations'
   ```

   Expect a relation with `type: "scaffoldedFrom"` and `targetRef: "template:default/cra-template"`.

   Or filter by relation target:

   ```bash
   curl -s -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/catalog/entities?filter=relations.scaffoldedFrom=template:default/cra-template&fields=metadata.name,relations"
   ```

5. End-to-end template execution, notifications, and PR flows require a consumer Backstage app (or overlays) with scaffolder/notifications/VCS configuration — not covered by this harness alone.

## When a consumer app or overlays are needed

This workspace intentionally does **not** ship `packages/app` or `packages/backend`. Use a full consumer Backstage instance when validating:

- Relation graph views for `scaffoldedFrom` / `scaffolderOf`
- Template-update notifications against `@backstage/plugin-notifications-backend`
- Template-update pull request creation against real GitHub/GitLab integrations

## Related packages

- [@backstage/plugin-catalog-backend](https://www.npmjs.com/package/@backstage/plugin-catalog-backend) — host catalog backend plugin for this module
- [@backstage-community/plugin-scaffolder-backend-module-annotator](https://github.com/backstage/community-plugins/tree/main/workspaces/scaffolder-backend-module-annotator) — adds `spec.scaffoldedFrom` during scaffolding
