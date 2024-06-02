---
'@backstage-community/plugin-vault-backend': patch
---

Added support to Kubernetes authentication for Vault.

The Vault backend supports now 2 types of authentication:

- `static`: The one available in the past. To keep using it, update the config to something like this:

  ```diff
  vault:
  -  token: <TOKEN>
  +  auth:
  +    type: static
  +    token: <TOKEN>
  ```

- `kubernetes`: New option to login using Kubernetes roles. Check the [README.md](../plugins/vault-backend/README.md) for more details

The old setup is still supported but will be removed in a future release. Make sure to update the format in the configuration file.
