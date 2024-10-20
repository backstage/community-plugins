# mend.io - backend

See the [mend plugin instructions](../mend/README.md).

### Plugin Permission (optional)

The plugin offers methods to construct conditional permissions an additional top layer to filter projects, which can be integrated into the your Organization Permission Policy.

- Provide a list of project IDs to the plugin. This will enable it to filter projects.
- Use the `exclude` property to fine-tune the filtering behavior, ensuring precise control over which projects are included or excluded from the permission set.

Here is a sample:

```ts
// ... other imports here
import {
  mendReadPermission,
  mendConditions,
  createMendProjectConditionalDecision,
} from '@mend/backstage-plugin-mend-backend';
// ... other polices
export class OrganizationPolicy implements PermissionPolicy {
    async handle(
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
      if (isPermission(request.permission, mendReadPermission)) {
        return createMendProjectConditionalDecision(
          request.permission,
          mendConditions.filter({
            ids: [], // List of project id
            exclude: true // Default
          }),
        );
      }
       // ... other conditions
      return {
        result: AuthorizeResult.ALLOW,
      };
    }
  }
// ...
```
