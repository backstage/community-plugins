---
'@backstage-community/plugin-azure-devops-backend': minor
---

**BREAKING** The `azureDevOps.token` setting is no longer used. It was announced as removed in 0.8.0, but was still read as a fallback for hosts without credentials in `integrations.azure`. If you use Azure DevOps Server and still set `azureDevOps.token`, move it to `integrations.azure`:

```yaml
integrations:
  azure:
    - host: tfs.company.com
      credentials:
        - personalAccessToken: ${AZURE_TOKEN}
```

**BREAKING** The `AzureDevOpsApi` class is no longer exported. It was only useful with the legacy backend system, which this plugin stopped supporting in 0.8.0. If you create `AzureDevOpsApi` in your own backend code, call the Azure DevOps REST API directly or use the `azure-devops-node-api` package instead.
