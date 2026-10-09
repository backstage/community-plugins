---
'@backstage-community/plugin-linguist-backend': patch
---

Align OpenAPI spec security with the standard plugin convention: drop the
document-level `security` default, rename the scheme to `JWT`, and declare
security per-operation. Avoids a merge-ordering issue in the aggregated
Backstage API spec produced by
`@backstage/plugin-catalog-backend-module-backstage-openapi`. See
backstage/backstage#36081 for context.
