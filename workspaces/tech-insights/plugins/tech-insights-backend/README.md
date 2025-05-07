# Tech Insights Backend

The backend plugin for Tech Insights.

## Installation

### Install the package

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-tech-insights-backend
```

### Add the plugin to your backend

```ts title="packages/backend/src/index.ts"
// Add the following to `packages/backend/src/index.ts`
backend.add(import('@backstage-community/plugin-tech-insights-backend'));
```

## Built-in Defaults

### Included FactRetrievers

`FactRetrievers` are only registered if configured in the `app-config.yaml`. Meaning that while you have the tech insights backend installed, you will not have any fact retrievers present in your application.

There are three built-in FactRetrievers that come with Tech Insights:

- `entityMetadataFactRetriever`: Generates facts which indicate the completeness of entity metadata
- `entityOwnershipFactRetriever`: Generates facts which indicate the quality of data in the `spec.owner` field
- `techdocsFactRetriever`: Generates facts related to the completeness of techdocs configuration for entities

#### Registering the built-in FactRetrievers

The following example registers the built-in fact retrievers to run every 6 hours, while retaining the latest two weeks of fact data.

```yaml title="app-config.yaml"
techInsights:
  factRetrievers:
    entityMetadataFactRetriever:
      # How often the fact retriever should run
      cadence: '*/15 * * * *'
      # How long to keep the fact data
      lifecycle: { timeToLive: { weeks: 2 } }
    entityOwnershipFactRetriever:
      cadence: '*/15 * * * *'
      lifecycle: { timeToLive: { weeks: 2 } }
    techdocsFactRetriever:
      cadence: '*/15 * * * *'
      lifecycle: { timeToLive: { weeks: 2 } }
```

The optional `lifecycle` configuration value limits the lifetime of fact data. The value can be either `maxItems` or TTL (time to live). Valid options are either a number for `maxItems` or a Luxon duration-like object for TTL.

```yaml
# Lifecycle configuration examples
lifecycle: { timeToLive: { weeks: 2 } }

# Deletes all but 7 latest facts for each id/entity pair
lifecycle: { maxItems: 7 };

# Deletes all facts older than 2 weeks (TTL)
lifecycle: { timeToLive: 1209600000 } # Luxon duration like object
lifecycle: { timeToLive: { weeks: 2 } }; # Human readable value
```

#### Running fact retrievers in a multi-instance installation

The Tech Insights plugin utilizes `SchedulerService` to schedule and coordinate task invocation across instances. See [the SchedulerService documentation](https://backstage.io/docs/reference/backend-plugin-api.schedulerservice/) for more information.

### Included FactChecker

**NOTE**: You need a Fact Checker configured to get access to the backend routes that will allow the facts to be checked. If you don't have one configured, you will see 404s and potentially other errors.

There is a default FactChecker implementation provided in the [@backstage-community/plugin-tech-insights-backend-module-jsonfc](../tech-insights-backend-module-jsonfc/README.md) module. This implementation uses `json-rules-engine` as the underlying functionality to run checks.

You must install the module into your backend system to use the fact checker.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-tech-insights-backend-module-jsonfc
```

```diff title="packages/backend/src/index.ts"
// Add the following to `packages/backend/src/index.ts`
backend.add(import('@backstage-community/plugin-tech-insights-backend'));
+backend.add(import('@backstage-community/plugin-tech-insights-backend-module-jsonfc'));
```

Then, configure the checks in the `app-config.yaml` file. The following example configures a _check_ to verify a group has been set as the `spec.owner` for an entity. The check uses the `entityOwnershipFactRetriever` fact retriever to get the data.

```yaml title="app-config.yaml"
techInsights:
  factRetrievers: ...
  factChecker:
    checks:
      groupOwnerCheck:
        type: json-rules-engine
        name: Group Owner Check
        description: Verifies that a group has been set as the spec.owner for this entity
        factIds:
          - entityOwnershipFactRetriever
        rule:
          conditions:
            all:
              - fact: hasGroupOwner
                operator: equal
                value: true
```

## Creating custom implementations of FactRetrievers

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

export const myFactRetriever: FactRetriever = {
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
    const { discovery, config, logger, auth } = ctx;

    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

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
          examplenumberfact: 2,
        },
        // (optional) timestamp to use as a Luxon DateTime object
      };
    });
  },
};
```

Additional FactRetrievers are added to the Tech Insights backend by creating a new backend module and registering the FactRetriever with the `techInsightsFactRetrieversExtensionPoint` extension point. This, along with other extension points, are available in the [@backstage-community/plugin-tech-insights-node](../tech-insights-node/README.md) library.

```ts title="plugins/tech-insights-backend-module-my-fact-retriever/src/module.ts"
import { techInsightsFactRetrieversExtensionPoint } from '@backstage-community/plugin-tech-insights-node';
import { myFactRetriever } from './myFactRetriever';

export const techInsightsModuleMyFactRetriever = createBackendModule({
  pluginId: 'tech-insights',
  moduleId: 'my-fact-retriever',
  register(reg) {
    reg.registerInit({
      deps: {
        providers: techInsightsFactRetrieversExtensionPoint,
      },
      async init({ providers }) {
        providers.addFactRetrievers({
          myFactRetriever,
        });
      },
    });
  },
});
```

### Adding a fact checker

If you want to implement your own FactChecker, for example to be able to handle other than `boolean` result types, you can do so by implementing `FactCheckerFactory` and `FactChecker` interfaces from `@backstage-community/plugin-tech-insights-common` package.

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
