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

## Inserting facts from an external module (e.g. incremental ingestion)

The `FactRetriever` pipeline collects all facts for a given retriever in a
single in-memory batch. For very large data sources — for example, an
incremental ingestion engine that walks catalog entities in bursts — it is
useful to write facts directly to the store, one batch at a time, without
registering a `FactRetriever`.

The tech insights backend exposes a plugin-scoped service for this:
`techInsightsFactInsertServiceRef` (defined in
`@backstage-community/plugin-tech-insights-node`). The factory is registered
automatically when you add this package to your backend — no extra wiring is
required:

```ts title="packages/backend/src/index.ts"
backend.add(import('@backstage-community/plugin-tech-insights-backend'));
```

> If you prefer to opt in explicitly (for example, when consuming the named
> `techInsightsPlugin` export directly instead of the default), the factory
> is also exported as `techInsightsFactInsertServiceFactory` and can be added
> separately with `backend.add(techInsightsFactInsertServiceFactory)`.

The service exposes a narrow write-only surface:

```ts
interface TechInsightsFactInsertService {
  insertFactSchema(schemaDefinition: FactSchemaDefinition): Promise<void>;
  insertFacts(options: {
    id: string;
    facts: TechInsightFact[];
    lifecycle?: FactLifecycle;
  }): Promise<void>;
}
```

### Pattern

`techInsightsFactInsertServiceRef` is plugin-scoped to `tech-insights`, so
its factory only binds inside a `pluginId: 'tech-insights'` module. Many
external triggers — incremental ingestion in particular — live on the
`catalog` plugin, so the two cannot be wired in a single module. The
recommended shape is **one module per plugin scope, communicating via a
shared module-level holder**:

```ts
// Captured by the tech-insights module, read by the catalog module.
const factInsertHolder: { current?: TechInsightsFactInsertService } = {};

// Module on `tech-insights`: register the schema once and stash the service.
createBackendModule({
  pluginId: 'tech-insights',
  moduleId: 'my-fact-capture',
  register(env) {
    env.registerInit({
      deps: { factInsert: techInsightsFactInsertServiceRef },
      async init({ factInsert }) {
        factInsertHolder.current = factInsert;
        await factInsert.insertFactSchema({
          id: 'my-incremental-facts',
          version: '0.1.0',
          entityFilter: [{ kind: 'Component' }],
          schema: {
            myCount: { type: 'integer', description: 'A counted value' },
          },
        });
      },
    });
  },
});

// Module on `catalog`: register an incremental provider whose `next()`
// reads from `factInsertHolder.current` and writes via `insertFacts`.
```

Two caveats worth knowing before copying this:

1. The catalog module's `init` may resolve before the tech-insights
   module's `init`. The provider's `next()` must defend against an empty
   holder — throwing explicitly is preferable so the incremental engine
   surfaces the misconfiguration instead of silently skipping facts.
2. The holder retains a reference across hot-reloads in dev, which can
   keep a stale service alive longer than expected. Don't store anything
   in it other than the service itself.

`insertFactSchema` is idempotent for a given `(id, version)` pair and only
needs to be called once at startup; `insertFacts` may be called repeatedly
(once per entity in a single-entity iteration pattern).

### Runnable example

A complete, runnable version of this pattern — including the catalog
module that drives the incremental provider — lives in this repository at
[`workspaces/tech-insights/packages/backend/src/plugins/incrementalFactExample.ts`](../../packages/backend/src/plugins/incrementalFactExample.ts).
It is wired into the example backend's
[`index.ts`](../../packages/backend/src/index.ts) alongside
`@backstage/plugin-catalog-backend-module-incremental-ingestion`. Use it as
the canonical reference; the snippet above only shows the cross-plugin
glue.

> The example uses incremental ingestion as a **scheduler over catalog
> entities** rather than as a source of catalog entities — its `next()`
> returns `entities: []` so it never mutates the catalog. The actual write
> goes to the tech insights store via `factInsert.insertFacts`.

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
