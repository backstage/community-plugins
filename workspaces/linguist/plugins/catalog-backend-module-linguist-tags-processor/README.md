# Linguist Tags Processor backend module for the Catalog plugin

## Overview

The Linguist Tags Processor can be added into your catalog as a way to incorporate the language breakdown from Linguist as `metadata.tags` on your entities. Doing so enables the ability to easily filter for entities in your catalog index based on the language of the source repository.

## Setup

To setup the Linguist Tags Processor you'll need to first run this command to add the package:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-linguist-tags-processor
```

Then in your `/packages/backend/src/index.ts` file you simply add the following line:

```diff
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();

   // ... other feature additions

+  backend.add(import('@backstage-community/plugin-catalog-backend-module-linguist-tags-processor'));

   backend.start();
```

### Legacy Setup

To setup the Linguist Tags Processor when using the legacy backend you'll first need to run this command to add the package:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-linguist-tags-processor
```

Then you will need to make the following changes in your `/packages/backend/src/plugins/catalog.ts` file:

```ts
import { LinguistTagsProcessor } from '@backstage-community/plugin-linguist-backend';
// ...
export default async function createPlugin(
  // ...
  builder.addProcessor(
    LinguistTagsProcessor.fromConfig(env.config, {
      logger: env.logger,
      discovery: env.discovery,
    })
  );
```

```diff
  import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
  import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
  import { Router } from 'express';
  import { PluginEnvironment } from '../types';
+ import { LinguistTagsProcessor } from '@backstage-community/plugin-catalog-backend-module-linguist-tags-processor';

  export default async function createPlugin(
    env: PluginEnvironment,
  ): Promise<Router> {
    const builder = await CatalogBuilder.create(env);
    builder.addProcessor(new ScaffolderEntitiesProcessor());
+   builder.addProcessor(LinguistTagsProcessor.fromConfig(env.config, { logger: env.logger, discovery: env.discovery });
    const { processingEngine, router } = await builder.build();
    await processingEngine.start();
    return router;
  }
```

### Processor Options

The processor can be configured in `app-config.yaml`, here is an example Linguist Tag Processor configuration:

```yaml
linguist:
  tagsProcessor:
    bytesThreshold: 1000
    languageTypes: ['programming', 'markup']
    languageMap:
      Dockerfile: ''
      TSX: 'react'
    tagPrefix: 'lang:'
    cacheTTL:
      hours: 24
```

#### `languageMap`

The `languageMap` option allows you to build a custom map of linguist languages to how you want them to show up as tags. The keys should be exact matches to languages in the [linguist dataset](https://github.com/github-linguist/linguist/blob/master/lib/linguist/languages.yml) and the values should be how they render as backstage tags. These values will be used "as is" and will not be further transformed.

Keep in mind that backstage has [character requirements for tags](https://backstage.io/docs/features/software-catalog/descriptor-format#tags-optional). If your map emits an invalid tag, it will cause an error during processing and your entity will not be processed.

If you map a key to `''`, it will not be emitted as a tag. This can be useful if you want to ignore some of the linguist languages.

```yaml
linguist:
  tagsProcessor:
    languageMap:
      # You don't want dockerfile to show up as a tag
      Dockerfile: ''
      # Be more specific about what the file is
      HCL: terraform
      # A more casual tag for a formal name
      Protocol Buffer: protobuf
```

#### `tagPrefix`

The `tagPrefix` option allows you to provide a prefix to all tags created by linguist. Keep in mind that backstage has [character requirements for tags](https://backstage.io/docs/features/software-catalog/descriptor-format#tags-optional). If your prefix emits an invalid tag, it will cause an error during processing and your entity will not be processed.

As an example, use the following config to get tags like `lang:java` instead of just `java`.

```yaml
linguist:
  tagsProcessor:
    tagPrefix: 'lang:'
```

#### `cacheTTL`

The `cacheTTL` option allows you to determine for how long this processor will cache languages for an `entityRef` before refreshing from the linguist backend. As this processor will run continuously, this cache is supplied to limit the load done on the linguist DB and API.

By default, this processor will cache languages for 30 minutes before refreshing from the linguist database.

You can optionally disable the cache entirely by passing in a `cacheTTL` duration of 0 minutes.

```yaml
linguist:
  tagsProcessor:
    cacheTTL: { minutes: 0 }
```

#### `bytesThreshold`

The `bytesThreshold` option allows you to control a number of bytes threshold which must be surpassed before a language tag will be emitted by this processor. As an example, some repositories may have short build scripts written in Bash, but you may only want the main language of the project emitted (an alternate way to control this is to use the `languageMap` to map `Shell` languages to `undefined`).

```yaml
linguist:
  tagsProcessor:
    # Ignore languages with less than 5000 bytes in a repo.
    bytesThreshold: 5000
```

#### `languageTypes`

The `languageTypes` option allows you to control what categories of linguist languages are automatically added as tags. By default, this will only include language tags of type `programming`, but you can pass in a custom array here to allow adding other language types.

You can see the full breakdown of linguist supported languages [in their repo](https://github.com/github-linguist/linguist/blob/master/lib/linguist/languages.yml).

For example, you may want to also include languages of type `data`

```yaml
linguist:
  tagsProcessor:
    languageTypes:
      - programming
      - data
```

#### `shouldProcessEntity`

The `shouldProcessEntity` is a function you can pass into the processor which determines which entities should have language tags fetched from linguist and added to the entity. By default, this will only run on entities of `kind: Component`, however this function let's you fully customize which entities should be processed.

> Note: this is not currently supported with the new backend system

As an example, you may choose to extend this to support both `Component` and `Resource` kinds along with allowing an opt-in annotation on the entity which entity authors can use.

As this option is a function, it cannot be configured in `app-config.yaml`. You must pass this as an option within typescript.

```ts
LinguistLanguageTagsProcessor.fromConfig(env.config, {
  logger: env.logger,
  discovery: env.discovery,
  shouldProcessEntity: (entity: Entity) => {
    if (
      ['Component', 'Resource'].includes(entity.kind) &&
      entity.metadata.annotations?.['some-custom-annotation']
    ) {
      return true;
    }
    return false;
  },
});
```
