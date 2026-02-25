---
'@backstage-community/plugin-argocd': patch
---

Fix HTTP 500 errors and incorrect rendering for multi-source ArgoCD applications that include Helm chart sources.

When an ArgoCD Application has multiple sources and one is a Helm chart (i.e. `spec.sources[i].chart` is set), the backend was calling the ArgoCD revision metadata endpoint with the chart version string (e.g. `6.33.0`) as the revision ID. The ArgoCD API endpoint `/revisions/{revision}/metadata` only accepts git commit SHAs and returns HTTP 500 for chart version strings, producing a continuous stream of backend errors on every entity page load.

- `getRevisionDetailsList` now skips the revision metadata API call when the source at the given index is a Helm chart source.
- `getUniqueRevisions` now excludes Helm chart version strings from multi-source apps so they are not passed to the revision metadata endpoint.
- `isAppHelmChartType` now correctly returns `true` for multi-source apps that include at least one Helm chart source, fixing the revision link rendering in the Deployment Summary table.
