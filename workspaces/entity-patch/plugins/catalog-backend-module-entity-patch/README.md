# @backstage-community/plugin-catalog-backend-module-entity-patch

A Backstage catalog backend module that applies entity-patch data to catalog entities during processing.

> **See also** — patch data is stored by [`@backstage-community/plugin-entity-patch-backend`](../entity-patch-backend/README.md). The frontend form that produces that data lives in [`@backstage-community/plugin-entity-patch`](../entity-patch/README.md).

---

## What the processor does

On every catalog processing loop, `EntityPatchProcessor` runs for each entity in the catalog:

1. **Fetches patch data** from the backend API
2. **Applies scalar patches** — for each `mapping` entry that points to an entity path (e.g. `metadata.description`, `spec.owner`),
3. **Emits custom relations** — for each `mapping` entry that references a relation pair (e.g. `relations.hasTechLead`), the processor emits both directions of the relation via `postProcessEntity`:
   - the **forward** relation on the source entity (e.g. `group:default/platform-team` → `hasTechLead` → `user:default/alice`)
   - the **reverse** relation on each target entity (e.g. `user:default/alice` → `techLeadOf` → `group:default/platform-team`)

Relations are resolved using the `entityPatch.relations` registry declared in `app-config.yaml`.

---

## Installation

```sh
yarn add @backstage-community/plugin-catalog-backend-module-entity-patch
```

Register the module in your backend:

```ts
// packages/backend/src/index.ts
const backend = createBackend();

// ... other plugins
backend.add(import('@backstage-community/plugin-entity-patch-backend'));
backend.add(
  import('@backstage-community/plugin-catalog-backend-module-entity-patch'),
);

backend.start();
```

---

## Configuration

### Scalar field mapping

Mapping values use a dot-separated entity path and are applied directly to the entity:

```yaml
mapping:
  metadata.description: description
  metadata.annotations.slack.com/channel: slackChannel
  spec.owner: owner
```

### Template mapping values

When a mapping value contains `{{`, it is treated as a **Nunjucks template** and rendered using the saved form data as context. Use this to compose annotations from multiple fields or transform values before writing them to the entity.

```yaml
mapping:
  metadata.description: description # plain field — value copied directly
  # Template: build the GitHub project slug from two separate form fields.
  # Annotation keys with dots must use bracket notation (["github.com/..."]).
  'metadata.annotations["github.com/project-slug"]': '{{ githubOrg }}/{{ githubRepo }}'
```

The template has access to all saved field values for that patch. It is rendered at write time by the catalog processor — not by the frontend.

> **Note:** Template-mapped paths cannot be pre-filled when the dialog opens (the rendered value on the entity cannot be decomposed back into individual field values). The form fields used in a template will open blank and load from the saved patch overlay instead.

### Relation pair registry

To emit bidirectional custom relations, declare them in `app-config.yaml` under `entityPatch.relations`. Each entry defines a pair of relation type strings — one placed on the source entity (forward) and one placed on each target entity (reverse).

```yaml
entityPatch:
  relations:
    - name: productOwner # human-readable label (informational only)
      forward: hasProductOwner # relation type on the source entity (e.g. Group)
      reverse: productOwnerOf # relation type on each target entity (e.g. User)

    - name: techLead
      forward: hasTechLead
      reverse: techLeadOf
```

Then reference these pairs in a patch `mapping` using the `relations.{type}` syntax, where `{type}` is either the `forward` or `reverse` type string:

```yaml
entityPatch:
  patches:
    - name: team-roles
      filter:
        kind: group
        'spec.type': team
      mapping:
        relations.hasProductOwner: productOwners # → emits hasProductOwner + productOwnerOf
        relations.hasTechLead: techLeads # → emits hasTechLead + techLeadOf
      sections:
        - title: Team Roles
          properties:
            productOwners:
              title: Product Owners
              type: array
              'ui:field': MultiEntityPicker
              'ui:options':
                catalogFilter:
                  - kind: User
            techLeads:
              title: Tech Leads
              type: array
              'ui:field': MultiEntityPicker
              'ui:options':
                catalogFilter:
                  - kind: User
```
