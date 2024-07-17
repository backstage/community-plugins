# Catalog Backend Module for Scaffolder Relation Catalog Processor

This is an extension module to the catalog-backend plugin, providing an additional catalog entity processor that adds a new relation that depends on the `spec.scaffoldedFrom` field to link scaffolder templates and the catalog entities they generated.

## Getting Started

1. Install the scaffolder relation catalog processor module using the following command:

   ```console
   yarn workspace backend add @backstage-community/plugin-catalog-backend-module-scaffolder-relation-processor
   ```

### Installing on the new backend system

To install this module into the [new backend system](https://backstage.io/docs/backend-system/), add the following into the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts
const backend = createBackend();

// highlight-add-start
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-scaffolder-relation-processor/alpha'
  ),
);
// highlight-add-end

backend.start();
```

### Installing on the legacy backend system

To install this module into the legacy backend system, add the following to the `packages/backend/src/plugins/catalog.ts` file:

```ts title=packages/backend/src/plugins/catalog.ts
// highlight-add-start
import { ScaffolderRelationEntityProcessor } from '@backstage-community/plugin-catalog-backend-module-scaffolder-relation-processor';

// highlight-add-end

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  /* ... other processors and/or providers ... */
  // highlight-add-start
  builder.addProcessor(new ScaffolderRelationEntityProcessor());
  // highlight-add-end

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  return router;
}
```

### Usage

Catalog entities containing the `spec.scaffoldedFrom` field will have a relation link be formed between it and the `template` corresponding to the entity ref in the `spec.scaffoldedFrom` field.

This link can be viewed in the `relations` field of the Raw YAML view of a catalog entity when inspecting an entity. In the entity with the `spec.scaffoldedFrom` field, the relation type is `scaffoldedFrom` with a target pointing to the value of the `spec.scaffoldedFrom` field. Conversely, for the target template, it will have a relation type of `ScaffolderOf` with a target pointing to the entity with the `spec.scaffoldedFrom` field.

These relations should also appear on the `EntityCatalogGraphView` component from the `@backstage/plugin-catalog-graph` package (only if the entity corresponding to the entity ref exists in the catalog).

#### Example graph view

![scaffoldedFrom Relation Graph View](./docs/example-images/scaffoldedFromGraphView.png)
![scaffolderOf Relation Graph View](./docs/example-images/scaffolderOfGraphView.png)

#### Example Raw YAML view

![scaffoldedFrom Relation YAML View](./docs/example-images/scaffoldedFromYAMLView.png)
![scaffoldedOf Relation YAML View](./docs/example-images/scaffolderOfYAMLView.png)
