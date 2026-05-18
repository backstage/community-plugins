---
'@backstage-community/plugin-rbac-backend': patch
---

Hardens RBAC policy handling to prevent Casbin CSV poisoning and improve error visibility.

Key fixes:

- Rejects permission policy `permission` values containing `"` before persistence (prevents known CSV parse failures).
- Rethrows `loadPolicy` failures after audit logging so mutation/read paths surface the root cause instead of secondary errors.
- Improves policy API request validation and missing-role handling (`400`/`404` where appropriate).
- Validates default configured permissions/admin refs with the same stricter checks used by runtime write paths.
- Strengthens conditional and plugin-id payload validation and aligns owner filtering behavior for default roles.

Compatibility notes:

- Requests/config entries using `permission` values with embedded `"` are now rejected.
- Conditional policy payloads and conditional YAML ingestion now enforce limits.
- Conditional `permissionMapping` must list distinct Backstage permission actions (no duplicates); at most one entry per supported action (`create`, `read`, `update`, `delete`, `use`).
- Plugin ID registration payloads now enforce count/length/duplicate checks.
- For larger existing payloads, limits are configurable via:

- `permission.rbac.validation.conditionalPolicies.maxConditionDepth`
- `permission.rbac.validation.conditionalPolicies.maxConditionNodeCount`
- `permission.rbac.validation.conditionalPolicies.maxCriteriaItems`
- `permission.rbac.validation.conditionalPoliciesFile.maxBytes`
- `permission.rbac.validation.conditionalPoliciesFile.maxDocuments`

Operational note:

- CSV policy files are parsed line-by-line; malformed lines are skipped with warnings instead of aborting the entire file load.
