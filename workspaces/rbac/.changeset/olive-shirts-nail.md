---
'@backstage-community/plugin-rbac-backend': patch
---

This patch hardens RBAC policy loading and validation to prevent CSV-poisoning failures and improve recovery behavior.

It now rejects policy permission strings containing double quotes before persistence, rethrows `loadPolicy` failures after audit logging so root causes are surfaced, and parses RBAC CSV input line-by-line with skip-and-warn handling for malformed rows so one invalid line does not block policy file processing.

It also improves API validation and error clarity by requiring policy write bodies to be arrays, returning `NotFoundError` when role-scoped policy updates reference missing roles, validating configured default permissions with the same policy validator used by REST writes, failing fast on invalid configured admin entity references, tightening plugin ID payload validation, and aligning ownership filter checks with `IS_OWNER` semantics for default-role handling.

Conditional policy validation and file-ingestion limits are now configurable for safer upgrades in environments with larger policy sets:

- `permission.rbac.validation.conditionalPolicies.maxPermissionMappingItems`
- `permission.rbac.validation.conditionalPolicies.maxConditionDepth`
- `permission.rbac.validation.conditionalPolicies.maxConditionNodeCount`
- `permission.rbac.validation.conditionalPolicies.maxCriteriaItems`
- `permission.rbac.validation.conditionalPoliciesFile.maxBytes`
- `permission.rbac.validation.conditionalPoliciesFile.maxDocuments`
