---
'@backstage-community/plugin-rbac-backend': minor
'@backstage-community/plugin-rbac-common': minor
'@backstage-community/plugin-rbac-node': minor
'@backstage-community/plugin-rbac': minor
---

### Conditional policies: eliminate HTTP metadata dependency and support broad matching

**Fixed:**

- **`.find()` arbitrary name selection:** `processConditionMapping()` used `.find()` to resolve `(resourceType, action)` to a permission name, picking the first match arbitrarily when a plugin registers multiple permissions with the same pair (named variants). The function has been removed entirely — users now control the format directly.

- **`checkConflictedConditions` for named variants:** Updated conflict detection to allow separate conditional policies for different permission names with the same action and resourceType. For example, `playlist.list.update` and `playlist.followers.update` can now have independent conditions for the same role.

- **Frontend sends `{name, action}`:** The frontend now sends the permission name the user selected in the UI instead of discarding it and sending only the action string.

- **Startup race condition (#9429):** Eliminated HTTP calls to plugin metadata endpoints during conditional policy reconciliation. The YAML file watcher no longer calls `processConditionMapping()` — conditions are stored directly without server-side name resolution. This removes the dependency on target plugins being ready at startup.

**Added:**

- **`permissionMapping` accepts two formats:**

  - Action-only `['read']` — broad match, applies to all permissions with this action for the resourceType. Available in YAML conditional policies file and provider extension point (read-only in frontend UI).
  - Named `[{name: 'catalog.entity.read', action: 'read'}]` — specific match, targets exactly the named permission. Available in all entry points including REST API and frontend UI.

- **New types** exported from `@backstage-community/plugin-rbac-common`:

  - `PermissionMapping` — union type `PermissionAction | PermissionInfo`
  - `isPermissionInfo()` — type guard
  - `permissionMappingAction()` — extracts action from either format

- **REST API validation:** POST/PUT endpoints require `{name, action}` format for `permissionMapping` entries. Plain action strings are rejected with `InputError`. This ensures conditions created via REST API (editable in frontend UI) always have explicit permission names. Broad (action-only) format is supported in YAML and provider extension point where conditions are read-only in the UI.

- **Validation:** `{name, action}` entries are validated — empty permission names are rejected.

**Changed:**

- YAML conditional policies with action-only `permissionMapping` (e.g., `['read']`) are now stored as-is and match ALL permissions with that action for the given resourceType. Previously, the backend resolved the action to a single arbitrary permission name via HTTP. This affects only plugins with named variants — multiple permissions sharing the same `(resourceType, action)` pair (scaffolder, playlist). For most plugins where each action maps to one permission, behavior is unchanged. To target a specific permission, use the `{name, action}` format.

- Frontend and backend must be upgraded together — older frontend versions sending `['read']` to REST API will receive `InputError`.

**No DB migration required.** Existing `{name, action}` data in the database is already valid in the new `PermissionMapping` union type and continues to work unchanged.
