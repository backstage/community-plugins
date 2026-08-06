# RBAC — Backstage community-plugins workspace

Publishable packages live under `plugins/` (`rbac`, `rbac-backend`, `rbac-common`, `rbac-node`).

## Setup

```sh
yarn install
```

## Development

There is no `packages/app` in this workspace. Use per-plugin dev harnesses:

```sh
# Backend (policy, REST API)
yarn workspace @backstage-community/plugin-rbac-backend start

# Frontend UI (mocked APIs — default for UI work)
yarn workspace @backstage-community/plugin-rbac start:mock
```

See [plugins/rbac-backend/CONTRIBUTING.md](./plugins/rbac-backend/CONTRIBUTING.md) and [plugins/rbac/CONTRIBUTING.md](./plugins/rbac/CONTRIBUTING.md).

## Other commands

```sh
yarn test
yarn lint
yarn backstage-repo-tools knip-reports
```
