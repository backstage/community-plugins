# Keycloak workspace

Publishable plugins in this workspace:

- [@backstage-community/plugin-catalog-backend-module-keycloak](./plugins/catalog-backend-module-keycloak/) — operator docs: [README](./plugins/catalog-backend-module-keycloak/README.md); contributors: [CONTRIBUTING](./plugins/catalog-backend-module-keycloak/CONTRIBUTING.md)
- [@backstage-community/plugin-auth-backend-module-keycloak-provider](./plugins/auth-backend-module-keycloak/) — operator docs: [README](./plugins/auth-backend-module-keycloak/README.md); contributors: [CONTRIBUTING](./plugins/auth-backend-module-keycloak/CONTRIBUTING.md)

Day-to-day plugin work uses each package's `dev/` harness and package-level [`app-config.yaml`](./plugins/catalog-backend-module-keycloak/app-config.yaml) — see the contributor guides above.

The workspace [`app-config.yaml`](./app-config.yaml) is optional scaffolding only (for example if `packages/app` / `packages/backend` are added later). It is **not** used by the plugin harnesses.

From the workspace root:

```bash
yarn install
yarn tsc
yarn test
eval "$(./scripts/export-dev-env-from-realm.sh)"   # writes .env.dev.local; source it in other shells for curl
```
