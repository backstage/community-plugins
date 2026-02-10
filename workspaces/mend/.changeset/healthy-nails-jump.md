---
'@backstage-community/plugin-mend-backend': major
'@backstage-community/plugin-mend': major
---

- Updated Frontend system to provide the Backstage Portal Support
- **BREAKING** The permission-policy-based project filtering has been removed in favor of configuration-based `mend.permissionControl`. This is only applicable if you previously used the Mend permissions in your `PermissionPolicy` to control which project IDs are visible.

Previously, you might have configured project filtering like this in your organization policy:

```ts
// ... other imports here
import {
  mendReadPermission,
  mendConditions,
  createMendProjectConditionalDecision,
} from '@backstage-community/plugin-mend-backend';

export class OrganizationPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    if (isPermission(request.permission, mendReadPermission)) {
      return createMendProjectConditionalDecision(
        request.permission,
        mendConditions.filter({
          ids: [], // List of project ids
          exclude: true, // Default
        }),
      );
    }

    // ... other conditions
    return {
      result: AuthorizeResult.ALLOW,
    };
  }
}
```

You must now configure the equivalent behavior via `app-config.yaml`:

```yaml
mend:
  activationKey: ${MEND_ACTIVATION_KEY}
  permissionControl:
    ids:
      - <project-uuid-1> # Project UUID to filter
      - <project-uuid-2> # Another project UUID
    exclude: true # true = blocklist (exclude these), false = allowlist (only these)
```

Migration steps:

1. Copy the same `ids` list and `exclude` value you used in your permission policy into the `mend.permissionControl` configuration in `app-config.yaml`.
2. Remove the permission-related code (such as `mendReadPermission`, `mendConditions`, and `createMendProjectConditionalDecision` usage) from your custom permission policy file (for example, `packages/backend/src/plugins/permission.ts`).
3. Remove the Mend permission imports from `packages/backend/src/index.ts` and ensure your default policy continues to allow access (for example, by using an allow-all-policy if no other policy is defined).

```diff
backend.add(import('@backstage/plugin-permission-backend'));
+ backend.add(
+   import('@backstage/plugin-permission-backend-module-allow-all-policy'),
+  );
- backend.add(import('./plugins/permission'));
```
