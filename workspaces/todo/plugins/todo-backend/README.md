# @backstage-community/plugin-todo-backend

Backend for the `@backstage-community/plugin-todo` plugin. Assists in scanning for and listing `// TODO` comments in source code repositories.

## Installation

Install the `@backstage-community/plugin-todo-backend` package in your backend packages:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-todo-backend
```

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-todo-backend'));

  backend.start();
```

## Scanned Files

The included `TodoReaderService` and `TodoScmReader` works by getting the entity source location from the catalog.

The location source code is determined automatically. In case of the source code of the component is not in the same place of the entity YAML file, you can explicitly set the value of the [`backstage.io/source-location`](https://backstage.io/docs/features/software-catalog/well-known-annotations#backstageiosource-location) annotation of the entity, and if that is missing it falls back to the [`backstage.io/managed-by-location `](https://backstage.io/docs/features/software-catalog/well-known-annotations#backstageiomanaged-by-location) annotation. Only `url` locations are currently supported, meaning locally configured `file` locations won't work. Also note that dot-files and folders are ignored.

## Custom Parser Configuration

You can customize how the todos are read. By overriding the default implementation of the `todoReaderServiceRef` you can completely override the default implementation or tweak its configuration using some of the existing utilities, such as the `TodoScmReader` class.

`TodoScmReader` accepts a `TodoParser` option, which can be used to configure your own parser. The default one is based on [Leasot](https://github.com/pgilad/leasot) and supports a wide range of languages. You can add to the list of supported tags by configuring your own version of the built-in parser, for example:

```ts
import {
  coreServices,
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import {
  todoReaderServiceRef,
  TodoScmReader,
  createTodoParser,
} from '@backstage-community/plugin-todo-backend';

const todoReaderFactory = createServiceFactory({
  service: todoReaderServiceRef,
  deps: {
    reader: coreServices.urlReader,
    config: coreServices.rootConfig,
    logger: coreServices.logger,
  },
  async factory() {
    return TodoScmReader.fromConfig(config, {
      logger,
      reader,
      parser: createTodoParser({
        additionalTags: ['NOTE', 'XXX'],
      }),
    });
  },
});
```

don't forget to add the service factory defined above to your `packages/backend/src/index.ts`:

```diff
+ backend.add(todoReaderFactory);

  backend.start();
```
