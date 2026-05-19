---
'@backstage-community/plugin-argocd': patch
---

Fix HTTP 500 errors and incorrect rendering for multi-source ArgoCD applications that include Helm chart sources.

When an ArgoCD Application has multiple sources and one is a Helm chart (i.e. `spec.sources[i].chart` is set), the backend was calling the ArgoCD revision metadata endpoint with the chart version string (e.g. `6.33.0`) as the revision ID. The ArgoCD API endpoint `/revisions/{revision}/metadata` only accepts git commit SHAs and returns HTTP 500 for chart version strings, producing a continuous stream of backend errors on every entity page load.

- `getRevisionDetailsList` now skips the revision metadata API call when the source at the given index is a Helm chart source.
- `getUniqueRevisions` now excludes Helm chart version strings from multi-source apps so they are not passed to the revision metadata endpoint.
- `isAppHelmChartType` now correctly returns `true` for multi-source apps that include at least one Helm chart source, fixing the revision link rendering in the Deployment Summary table.
- Fixed the Revision column in the Deployment Summary table for multi-source apps: the previous `pop()` call mutated the cached history array causing the column to cycle between the commit SHA, the Helm version, and blank on successive React renders. The column now shows a stable combined string (e.g. `6.49.0 / abc1234`) — Helm chart versions in full and git SHAs truncated to 7 characters — linked to the first git source commit URL.
