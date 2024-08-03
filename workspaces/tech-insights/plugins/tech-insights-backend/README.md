# Tech Insights Backend

The backend plugin for Tech Insights.

It provides the API for the frontend tech insights, scorecards and fact visualization functionality,
as well as a framework to run fact retrievers and store fact values in to a data store.

## Installation

### Install the package

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-tech-insights-backend
```

### Adding the plugin to your backend

```ts title="packages/backend/src/index.ts"
// Add the following import to `packages/backend/src/index.ts`
backend.add(import('@backstage-community/plugin-tech-insights-backend'));
```

## Included FactRetrievers

At this point the Tech Insights backend is installed in your backend package, but
you will not have any fact retrievers present in your application.

There are three built-in FactRetrievers that come with Tech Insights:

- `entityMetadataFactRetriever`: Generates facts which indicate the completeness of entity metadata
- `entityOwnershipFactRetriever`: Generates facts which indicate the quality of data in the `spec.owner` field
- `techdocsFactRetriever`: Generates facts related to the completeness of techdocs configuration for entities

The [@backstage-community/plugin-tech-insights-node](../tech-insights-node/README.md) library provides extension points to add your own `FactRetriever` or set a custom `FactCheckerFactory`.

### Registering a FactRetriever

`FactRetrievers` only get registered if configured in the `app-config.yaml`.

The following example registers the `entityOwnershipFactRetriever` to run every 6 hours, while retaining the latest two weeks of fact data.

```yaml title="app-config.yaml"
techInsights:
  factRetrievers:
    entityOwnershipFactRetriever:
      cadence: '*/15 * * * *'
      lifecycle: { timeToLive: { weeks: 2 } }
```

The `lifecycle` configuration value is optional that will limit the lifetime of fact data. This can be either MaxItems or TTL (time to live). Valid options for this value are either a number for MaxItems or a Luxon duration like object for TTL. 

For example:

```ts
const maxItems = { maxItems: 7 }; // Deletes all but 7 latest facts for each id/entity pair
const ttl = { timeToLive: 1209600000 }; // (2 weeks) Deletes items older than 2 weeks
const ttlWithAHumanReadableValue = { timeToLive: { weeks: 2 } }; // Deletes items older than 2 weeks
```

### Adding fact retrievers

To have the implemented FactRetrieverEngine within this package to be able to retrieve and store fact data into the database, you need to add these.

### Running fact retrievers in a multi-instance installation

The Tech Insights plugin utilizes the `PluginTaskScheduler` for scheduling tasks and coordinating the task invocation across instances. See [the PluginTaskScheduler documentation](https://backstage.io/docs/reference/backend-tasks.plugintaskscheduler) for more information.

## Adding a fact checker

There is a default FactChecker implementation provided in module [@backstage-community/plugin-tech-insights-backend-module-jsonfc](../tech-insights-backend-module-jsonfc/README.md). This implementation uses `json-rules-engine` as the underlying functionality to run checks.

If you want to implement your own FactChecker, for example to be able to handle other than `boolean` result types, you can do so by implementing `FactCheckerFactory` and `FactChecker` interfaces from [@backstage-community/plugin-tech-insights-common](../tech-insights-common/README.md) package.















## Customization
### Creating Fact Retrievers

A Fact Retriever consist of four required and one optional parts:

1. `id` - unique identifier of a fact retriever
2. `version`: A semver string indicating the current version of the schema and the handler
3. `schema` - A versioned schema defining the shape of data a fact retriever returns
4. `handler` - An asynchronous function handling the logic of retrieving and returning facts for an entity
5. `entityFilter` - (Optional) EntityFilter object defining the entity kinds, types and/or names this fact retriever handles

An example implementation of a FactRetriever could for example be as follows:

```ts
import { FactRetriever } from '@backstage-community/plugin-tech-insights-node';

const myFactRetriever: FactRetriever = {
  id: 'documentation-number-factretriever', // unique identifier of the fact retriever
  version: '0.1.1', // SemVer version number of this fact retriever schema. This should be incremented if the implementation changes
  entityFilter: [{ kind: 'component' }], // EntityFilter to be used in the future (creating checks, graphs etc.) to figure out which entities this fact retrieves data for.
  schema: {
    // Name/identifier of an individual fact that this retriever returns
    examplenumberfact: {
      type: 'integer', // Type of the fact
      description: 'A fact of a number', // Description of the fact
    },
  },
  handler: async ctx => {
    // Handler function that retrieves the fact
    const { discovery, config, logger } = ctx;
    const catalogClient = new CatalogClient({
      discoveryApi: discovery,
    });
    const entities = await catalogClient.getEntities(
      {
        filter: [{ kind: 'component' }],
      },
      { token },
    );
    /**
     * snip: Do complex logic to retrieve facts from external system or calculate fact values
     */

    // Respond with an array of entity/fact values
    return entities.items.map(it => {
      return {
        // Entity information that this fact relates to
        entity: {
          namespace: it.metadata.namespace,
          kind: it.kind,
          name: it.metadata.name,
        },

        // All facts that this retriever returns
        facts: {
          examplenumberfact: 2, //
        },
        // (optional) timestamp to use as a Luxon DateTime object
      };
    });
  },
};
```

### Adding a fact checker

This module comes with a possibility to additionally add a fact checker and expose fact checking endpoints from the API. To be able to enable this feature you need to add a FactCheckerFactory implementation to be part of the `DefaultTechInsightsBuilder` constructor call.

There is a default FactChecker implementation provided in module `@backstage-community/plugin-tech-insights-backend-module-jsonfc`. This implementation uses `json-rules-engine` as the underlying functionality to run checks. If you want to implement your own FactChecker, for example to be able to handle other than `boolean` result types, you can do so by implementing `FactCheckerFactory` and `FactChecker` interfaces from `@backstage-community/plugin-tech-insights-common` package.

To add the default FactChecker into your Tech Insights you need to install the module into your backend application:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-tech-insights-backend-module-jsonfc
```

and modify the `techInsights.ts` file to contain a reference to the FactChecker implementation.

```diff
+import { JsonRulesEngineFactCheckerFactory } from '@backstage-community/plugin-tech-insights-backend-module-jsonfc';

+const myFactCheckerFactory = new JsonRulesEngineFactCheckerFactory({
+   checks: [],
+   logger: env.logger,
+}),

 const builder = new DefaultTechInsightsBuilder({
   logger: env.logger,
   config: env.config,
   database: env.database,
   discovery: env.discovery,
   tokenManager: env.tokenManager,
   factRetrievers: [myFactRetrieverRegistration],
+  factCheckerFactory: myFactCheckerFactory
 });
```

NOTE: You need a Fact Checker Factory to get access to the backend routes that will allow the facts to be checked. If you don't have a Fact Checker Factory you will see 404s and potentially other errors.

To be able to run checks, you need to additionally add individual checks into your FactChecker implementation. For examples how to add these, you can check the documentation of the individual implementation of the FactChecker

#### Modifying check persistence

The default FactChecker implementation comes with an in-memory storage to store checks. You can inject an additional data store by adding an implementation of `TechInsightCheckRegistry` into the constructor options when creating a `JsonRulesEngineFactCheckerFactory`. That can be done as follows:

```diff
const myTechInsightCheckRegistry: TechInsightCheckRegistry<MyCheckType> = // snip
const myFactCheckerFactory = new JsonRulesEngineFactCheckerFactory({
  checks: [],
  logger: env.logger,
+ checkRegistry: myTechInsightCheckRegistry
}),

```

## Backend example

## Old backend example

Here's an example backend setup that will use the three included fact retrievers so you can get an idea of how this all works. This will be the entire contents of your `techInsights.ts` file found at `\packages\backend\src\plugins` as per [Adding the plugin to your `packages/backend`](#adding-the-plugin-to-your-packagesbackend)

```ts
import {
  createRouter,
  buildTechInsightsContext,
  createFactRetrieverRegistration,
  entityOwnershipFactRetriever,
  entityMetadataFactRetriever,
  techdocsFactRetriever,
} from '@backstage-community/plugin-tech-insights-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  JsonRulesEngineFactCheckerFactory,
  JSON_RULE_ENGINE_CHECK_TYPE,
} from '@backstage-community/plugin-tech-insights-backend-module-jsonfc';

const ttlTwoWeeks = { timeToLive: { weeks: 2 } };

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const techInsightsContext = await buildTechInsightsContext({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    scheduler: env.scheduler,
    factRetrievers: [
      createFactRetrieverRegistration({
        cadence: '0 */6 * * *', // Run every 6 hours - https://crontab.guru/#0_*/6_*_*_*
        factRetriever: entityOwnershipFactRetriever,
        lifecycle: ttlTwoWeeks,
      }),
      createFactRetrieverRegistration({
        cadence: '0 */6 * * *',
        factRetriever: entityMetadataFactRetriever,
        lifecycle: ttlTwoWeeks,
      }),
      createFactRetrieverRegistration({
        cadence: '0 */6 * * *',
        factRetriever: techdocsFactRetriever,
        lifecycle: ttlTwoWeeks,
      }),
    ],
    factCheckerFactory: new JsonRulesEngineFactCheckerFactory({
      logger: env.logger,
      checks: [
        {
          id: 'groupOwnerCheck',
          type: JSON_RULE_ENGINE_CHECK_TYPE,
          name: 'Group Owner Check',
          description:
            'Verifies that a Group has been set as the owner for this entity',
          factIds: ['entityOwnershipFactRetriever'],
          rule: {
            conditions: {
              all: [
                {
                  fact: 'hasGroupOwner',
                  operator: 'equal',
                  value: true,
                },
              ],
            },
          },
        },
        {
          id: 'titleCheck',
          type: JSON_RULE_ENGINE_CHECK_TYPE,
          name: 'Title Check',
          description:
            'Verifies that a Title, used to improve readability, has been set for this entity',
          factIds: ['entityMetadataFactRetriever'],
          rule: {
            conditions: {
              all: [
                {
                  fact: 'hasTitle',
                  operator: 'equal',
                  value: true,
                },
              ],
            },
          },
        },
        {
          id: 'techDocsCheck',
          type: JSON_RULE_ENGINE_CHECK_TYPE,
          name: 'TechDocs Check',
          description:
            'Verifies that TechDocs has been enabled for this entity',
          factIds: ['techdocsFactRetriever'],
          rule: {
            conditions: {
              all: [
                {
                  fact: 'hasAnnotationBackstageIoTechdocsRef',
                  operator: 'equal',
                  value: true,
                },
              ],
            },
          },
        },
      ],
    }),
  });

  return await createRouter({
    ...techInsightsContext,
    logger: env.logger,
    config: env.config,
  });
}
```
