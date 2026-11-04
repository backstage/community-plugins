---
'@backstage-community/plugin-linguist-backend': patch
---

Remove the plugin's `/health` endpoint. The handler returned a static
`{ status: 'ok' }` payload and was duplicated by Backstage's built-in
`/.backstage/health/v1/{liveness,readiness}` endpoints, which are the
health-check surface external orchestrators (Kubernetes, Nomad, Docker,
load balancers, …) are expected to hit. The endpoint had no callers
across the Backstage and community-plugins repos and nothing in the
Backstage docs references it. Opened as a PRFC
([backstage/backstage#36081](https://github.com/backstage/backstage/issues/36081)
for context) to confirm there are no undocumented use cases before
removal.
