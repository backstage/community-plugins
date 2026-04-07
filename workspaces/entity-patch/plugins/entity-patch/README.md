# @backstage-community/plugin-entity-patch

A Backstage frontend plugin that lets operators edit catalog entity fields through structured, schema-driven forms — without writing any custom UI code.

Patches are declared entirely in `app-config.yaml`. Each patch specifies which entities it applies to, what fields the form contains, and how those fields map back to entity properties. The result is an **Edit Patch** item in the entity context menu that opens a pre-populated dialog for any matching entity.

> **Backend required** — this plugin only renders the form and calls the API. Persisting data and applying it to the catalog requires the backend plugin and catalog processor. See [plugin-entity-patch-backend](../entity-patch-backend/README.md) and [plugin-catalog-backend-module-entity-patch](../catalog-backend-module-entity-patch/README.md).

---

## How it works

An **Edit Patch** item appears in the entity context menu for every entity that matches at least one configured patch filter.

![Entity context menu showing the Edit Patch option](docs/context-menu.png)

Clicking it opens a dialog with all matching patch sections, pre-populated with the values currently stored in the backend.

![Edit Patch dialog showing Team Details (description, slack channel) and Team Roles (PO and Tech Lead pickers)](docs/patch-dialog.png)

On save, each patch section is persisted to the backend and a catalog refresh is triggered so changes take effect as soon as the processing loop completes.

---

## Example — team profile with description, Slack channel, and role assignments

The configuration below adds an **Edit Patch** dialog to all `Group` entities of type `team`. It demonstrates three common field patterns:

- a **markdown-friendly multiline textarea** for the team description
- a **validated text field** for the Slack contact channel
- **entity picker arrays** that map to catalog relations (`hasProductOwner` / `hasTechLead`)

```yaml
# app-config.yaml

entityPatch:
  # Declare the bidirectional relation pairs the processor will emit.
  # Each entry defines a forward relation (on the source entity) and a
  # reverse relation (on each target entity).
  relations:
    - name: productOwner
      forward: hasProductOwner # added to the Group entity
      reverse: productOwnerOf # added to each User entity
    - name: techLead
      forward: hasTechLead # added to the Group entity
      reverse: techLeadOf # added to each User entity

  patches:
    # ── Patch 1: team profile fields ─────────────────────────────────────────
    - name: team-profile
      filter:
        kind: group
        'spec.type': team
      # mapping connects each form field to its entity path.
      # The backend processor reads this to apply values and emit relations.
      mapping:
        description: metadata.description # scalar — written directly
        slackChannel: metadata.annotations.slack/channel
      sections:
        - title: Team Details
          description: Basic information shown on the team catalog page.
          required:
            - description
          properties:
            description:
              title: Description
              type: string
              description: >
                A brief description of this team. Markdown is supported.
              'ui:widget': textarea # multiline, markdown-friendly

            slackChannel:
              title: Slack Channel
              type: string
              pattern: '^#[a-z0-9_-]+$'
              description: Primary Slack channel for reaching this team.
              errorMessage:
                pattern: 'Must start with # followed by lowercase letters, numbers, hyphens, or underscores'

    # ── Patch 2: team role assignments (relations) ────────────────────────────
    - name: team-roles
      filter:
        kind: group
        'spec.type': team
      mapping:
        # relations.{type} — the processor resolves these as relation pairs
        # and emits both the forward and reverse directions in the catalog.
        productOwners: relations.hasProductOwner
        techLeads: relations.hasTechLead
      sections:
        - title: Team Roles
          description: Assign people to specific roles on this team.
          properties:
            productOwners:
              title: Product Owners
              type: array # array → MultiEntityPicker
              description: Users acting as Product Owner for this team.
              'ui:field': MultiEntityPicker # scaffolder custom field for picking multiple entities
              'ui:options':
                catalogFilter:
                  - kind: User

            techLeads:
              title: Tech Leads
              type: array
              description: Users acting as Tech Lead for this team.
              'ui:field': MultiEntityPicker
              'ui:options':
                catalogFilter:
                  - kind: User
```

---

## Installation

```sh
yarn add @backstage-community/plugin-entity-patch
```

Add the plugin to your app:

```ts
// packages/app/src/App.tsx (new frontend system)
import entityPatchPlugin from '@backstage-community/plugin-entity-patch';

export const app = createApp({
  features: [
    // ...
    entityPatchPlugin,
  ],
});
```

---

## Configuration reference

### `entityPatch.relations[]` — relation pair registry

Declares the bidirectional custom relation pairs that can be referenced in patch `mapping` values using the `relations.{type}` syntax. This block is read by the **catalog processor** — the frontend only uses it to know which fields are relation-typed.

| Key       | Type     | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| `name`    | `string` | Human-readable identifier for this pair (informational only).                |
| `forward` | `string` | Relation type emitted on the **source** entity (the one being patched).      |
| `reverse` | `string` | Relation type emitted on each **target** entity (the selected users/groups). |

### `entityPatch.patches[]` — patch definitions

| Key                      | Type                         | Description                                                                                                                                                                                          |
| ------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                   | `string`                     | Stable slug. Used as the storage key — do not change after data is persisted.                                                                                                                        |
| `filter`                 | `object`                     | Which entities this patch applies to. Supports `kind`, any entity path, and logical operators `$any`, `$all`, `$not`, `$in`, `$exists`.                                                              |
| `mapping`                | `Record<string, string>`     | Maps each field name to its entity path (`metadata.description`, `spec.owner`, …) or a relation reference (`relations.{type}`). Read by the backend — not used by the frontend.                      |
| `sections[]`             | `array`                      | One or more form sections. Each section groups related fields under a heading. Section properties imitate the Scaffolder template properties, and scaffolder custom fields can be used here as well. |
| `sections[].title`       | `string`                     | Section heading shown in the dialog.                                                                                                                                                                 |
| `sections[].description` | `string`                     | Optional subtitle shown below the section heading.                                                                                                                                                   |
| `sections[].required`    | `string[]`                   | Field names that must be non-empty before the form can be saved.                                                                                                                                     |
| `sections[].properties`  | `Record<string, JSONSchema>` | Field definitions (JSON Schema). Inline `ui:*` keys control rendering — see below.                                                                                                                   |

---

## Using scaffolder field extensions

The `ui:field`, `ui:widget`, and `ui:options` keys in a section property work **exactly the same as in Backstage scaffolder templates**. If you have used these in a `template.yaml`, the API is identical here.

```yaml
# Scaffolder template equivalent — both work the same way:
#   template.yaml             →   patch section property
#   ui:field: EntityPicker    →   'ui:field': EntityPicker
#   ui:options: ...           →   'ui:options': ...
```

Any scaffolder field extension registered in your app — either built-in or custom — is automatically available for use in patches.

### Common built-in `ui:field` values

| `ui:field`          | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `EntityPicker`      | Entity ref picker with optional kind/namespace filter    |
| `MultiEntityPicker` | Multi-select entity ref picker (produces an array)       |
| `EntityNamePicker`  | Autocomplete for entity names                            |
| `OwnerPicker`       | Entity picker constrained to ownable kinds (Group, User) |
| `EntityTagsPicker`  | Tag selector with autocomplete from existing entity tags |

### Common `ui:widget` values

| `ui:widget` | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| `textarea`  | Multiline text input — use for long descriptions or markdown content |
| `password`  | Masked single-line input                                             |
| `select`    | Dropdown — use with `enum` / `enumNames`                             |
| `radio`     | Radio button group — use with `enum` / `enumNames`                   |

For custom field extensions written with `createScaffolderFieldExtension`, register them in your app the same way you would for scaffolder templates and they become available in patches automatically.

See the [Backstage scaffolder field extension docs](https://backstage.io/docs/features/software-templates/writing-custom-field-extensions) for writing your own.

---

## Backend dependency

This plugin is the **frontend layer only**. Two additional packages are required for data to be persisted and applied to the catalog:

| Package                                                                                                               | Role                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@backstage-community/plugin-entity-patch-backend`](../entity-patch-backend/README.md)                               | REST API that stores and retrieves patch data per entity. Also triggers a catalog refresh after each save.                                      |
| [`@backstage-community/plugin-catalog-backend-module-entity-patch`](../catalog-backend-module-entity-patch/README.md) | Catalog processor that reads stored patches, applies scalar field values to entities, and emits configured custom relations in both directions. |

---

## Local development

```sh
yarn start
```

Opens a dev app at `http://localhost:3010` with mock entities.
Navigate to any entity page, open the **⋮** menu, and click **Edit Patch**.
