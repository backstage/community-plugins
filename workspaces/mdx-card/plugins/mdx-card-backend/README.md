# MDX Card Backend

Stores MDX card templates so they can be edited in the browser with the MDX card editor page and referenced from cards with `templateRef`. See the [MDX card plugin](../mdx-card/README.md) for the frontend.

## Installation

```sh
yarn --cwd packages/backend add @backstage-community/plugin-mdx-card-backend
```

Add the plugin to `packages/backend/src/index.ts`:

```ts
backend.add(import('@backstage-community/plugin-mdx-card-backend'));
```

Templates are stored in the plugin's database, which the backend creates and migrates on startup.

## Permissions

The plugin defines these permissions:

| Permission                 | Action                  |
| -------------------------- | ----------------------- |
| `mdx-card.template.read`   | List and read templates |
| `mdx-card.template.create` | Create templates        |
| `mdx-card.template.update` | Update templates        |
| `mdx-card.template.delete` | Delete templates        |

Templates run as JavaScript in the browsers of everyone who views them. Allow `create` and `update` only for trusted users. For example, in a permission policy:

```ts
import {
  mdxCardTemplateCreatePermission,
  mdxCardTemplateUpdatePermission,
} from '@backstage-community/plugin-mdx-card-common';

if (
  isPermission(request.permission, mdxCardTemplateCreatePermission) ||
  isPermission(request.permission, mdxCardTemplateUpdatePermission)
) {
  return user?.identity.ownershipEntityRefs.includes('group:default/admins')
    ? { result: AuthorizeResult.ALLOW }
    : { result: AuthorizeResult.DENY };
}
```

If the permission framework is disabled, every signed-in user can create, update and delete templates.

## API

All endpoints require a signed-in user.

| Method   | Path             | Description                                                         |
| -------- | ---------------- | ------------------------------------------------------------------- |
| `GET`    | `/templates`     | List templates without their content                                |
| `GET`    | `/templates/:id` | Get a template                                                      |
| `POST`   | `/templates`     | Create a template from `id`, `title`, `template` and `dataFetchers` |
| `PUT`    | `/templates/:id` | Replace `title`, `template` and `dataFetchers`                      |
| `DELETE` | `/templates/:id` | Delete a template                                                   |

Template IDs may contain lowercase letters, numbers and single dashes.
