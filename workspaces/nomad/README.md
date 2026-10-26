# Nomad plugins for Backstage

The Nomad plugins show [HashiCorp Nomad](https://www.nomadproject.io/) job versions and task group allocations for your components in Backstage.

## Plugins

This workspace contains:

- [nomad](./plugins/nomad/README.md) - The frontend plugin with the Job Versions card and Allocations table for the entity page.
- [nomad-backend](./plugins/nomad-backend/README.md) - The backend plugin that calls the Nomad API. The frontend plugin requires it.

## Quick start

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-nomad-backend
yarn --cwd packages/app add @backstage-community/plugin-nomad
```

Then add your cluster address (and a token, if ACLs are enabled) to `app-config.yaml`:

```yaml
nomad:
  addr: 'http://localhost:4646'
  token: ${NOMAD_TOKEN}
```

Components are linked to Nomad with the `nomad.io/job-id` and `nomad.io/group` annotations. See the [nomad plugin README](./plugins/nomad/README.md) for the annotations, entity page setup and a minimal ACL policy.
