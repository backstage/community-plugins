# Annotator custom action for Scaffolder Backstage

The annotator module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

This module allows users to create custom actions for annotating their entity objects. Additionally, it enables users to utilize existing custom actions provided by the module for annotating entities with timestamps and scaffolder entity references.

## Installation

### Available custom actions

| Action                    |                                               Description                                               |
| ------------------------- | :-----------------------------------------------------------------------------------------------------: |
| `catalog:timestamping`    |   Adds the `backstage.io/createdAt` annotation containing the current timestamp to your entity object   |
| `catalog:scaffolded-from` |           Adds `scaffoldedFrom` spec containing the template entityRef to your entity object            |
| `catalog:annotate`        | Allows you to annotate your entity object with specified label(s), annotation(s) and spec property(ies) |

To begin, install the module package into the backend workspace of your backstage instance:

```console
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-annotator
```

### Registering the annotator action plugin with the backend system

To install the module into the [backend system](https://backstage.io/docs/backend-system/), add the following into the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts
const backend = createBackend();

// highlight-add-start
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-annotator'),
);
// highlight-add-end

backend.start();
```

## Creating custom actions for your templates using the annotator module

### Create the custom action

#### The `createAnnotatorAction` action accepts the following parameters:

| Parameter Name                     |   Type   | Required | Description                                                                                                                                                                                                                                     |
| ---------------------------------- | :------: | :------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actionId`                         | `string` |   Yes    | A unique id for the action. Default: `catalog:annotate`, please provide one or else it may conflict with the generic `catalog:annotate` custom action that is provided by this module.                                                          |
| `actionDescription`                | `string` |    No    | A description of what the action accomplishes. Default: "Creates a new scaffolder action to annotate the entity object with specified label(s), annotation(s) and spec property(ies)."                                                          |
| `loggerInfoMsg`                    | `string` |    No    | A message that will be logged upon the execution of the action. Default: "Annotating your object"                                                                                                                                               |
| `annotateEntityObject.labels`      | `object` |    No    | Key-value pairs to be added to the `metadata.labels` of the entity                                                                                                                                                                              |
| `annotateEntityObject.annotations` | `object` |    No    | Key-value pairs to be added to the `metadata.annotations` of the entity                                                                                                                                                                         |
| `annotateEntityObject.spec`        | `object` |    No    | Key-value pairs to be added to the `spec` of the entity. The value for each key can either be a string or an object with the key `readFromContext`, enabling users to specify the path in the context from which the value should be retrieved. |

1. Create your [custom action](https://backstage.io/docs/features/software-templates/writing-custom-actions#writing-your-custom-action)

2. Add the annotator module package `@backstage-community/plugin-scaffolder-backend-module-annotator` into your module's `package.json`

3. In the action file, add the following snippet to it:

```ts createAddCompanyTitleAction.ts
// highlight-add-start
import { createAnnotatorAction } from '@backstage-community/plugin-scaffolder-backend-module-annotator';

export const createAddCompanyTitleAction = () => {
  return createAnnotatorAction(
    'catalog:company-title',
    'Creates a new `catalog:company-title` Scaffolder action to annotate scaffolded entities with the company title.',
    'Annotating catalog-info.yaml with the company title',
  );
};
// highlight-add-end
```

4. Install the custom action into your backstage instance following steps similar to the [installation instructions above](#installation)

### Use your custom action in your desired template(s)

#### The annotator template action accepts the following inputs

#### Input

| Parameter Name   |   Type   | Required | Description                                                                                                        |
| ---------------- | :------: | :------: | ------------------------------------------------------------------------------------------------------------------ |
| `labels`         | `object` |    No    | Key-value pairs to be added to the `metadata.labels` of the entity                                                 |
| `annotations`    | `object` |    No    | Key-value pairs to be added to the `metadata.annotations` of the entity                                            |
| `spec`           | `object` |    No    | Key-value pairs to be added to the `spec` of the entity                                                            |
| `entityFilePath` | `string` |    No    | The file path from which the YAML representation of the entity should be read                                      |
| `objectYaml`     | `object` |    No    | The YAML representation of the object/entity                                                                       |
| `writeToFile`    | `string` |    No    | The file path where the YAML representation of the entity should be stored. Default value is './catalog-info.yaml' |

#### Output

| Name              |   Type   | Description                                                                                  |
| ----------------- | :------: | -------------------------------------------------------------------------------------------- |
| `annotatedObject` | `object` | The entity object marked with your specified annotation(s), label(s), and spec property(ies) |

To annotate the entity file, add your custom action to your template file after `Fetch Skeleton + Template` step. Please note that your custom action needs to be installed into the backstage instance running the software template.

```yaml
// highlight-add-start
- id: company-title
  name: Add company title to catalog-info.yaml
  action: catalog:company-title
  input:
    labels: {
      company: 'My Company'
    }
// highlight-add-end
```
