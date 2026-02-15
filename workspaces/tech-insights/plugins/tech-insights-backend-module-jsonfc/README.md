# Tech Insights Backend JSON Rules engine fact checker module

This is an extension to module to tech-insights-backend plugin, which provides basic framework and functionality to implement tech insights within Backstage.

This module provides functionality to run checks against a [json-rules-engine](https://github.com/CacheControl/json-rules-engine) and provide boolean logic by simply building checks using JSON conditions.

## Getting started

To add this FactChecker into your Tech Insights you need to install the module into your backend application:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-tech-insights-backend-module-jsonfc
```

### Add to the backend

```ts title="packages/backend/src/index.ts"
backend.add(
  import('@backstage-community/plugin-tech-insights-backend-module-jsonfc'),
);
```

Looking for the old backend system docs? Visit [here](./docs/old-backend-system.md).

## Adding checks in config

Example:

```yaml title="app-config.yaml"
techInsights:
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

### More than one `factIds` for a check

When more than one is supplied, the requested fact **MUST** be present in at least one of the fact retrievers.
The order of the fact retrievers defined in the `factIds` array has no bearing on the checks, the check will merge all facts from the various retrievers, and then check against latest fact .

### Adding filter in check

Filters allow you to selectively run checks only on entities that match specific criteria. This is useful when you want different checks to apply to different types of entities.

Filters are defined using the `filter` property in your check configuration. The filter can match entity properties using dot notation to access nested fields.

#### Basic Filter (AND logic within filter)

When multiple fields are specified in a single filter object, ALL conditions must match (AND logic):

```yaml title="app-config.yaml"
techInsights:
  factChecker:
    checks:
      groupOwnerCheck:
        type: json-rules-engine
        name: Group Owner Check
        description: Verifies that a group has been set as the spec.owner for this entity
        factIds:
          - entityOwnershipFactRetriever
        filter:
          kind: component
          spec.lifecycle: production
        rule:
          conditions:
            all:
              - fact: hasGroupOwner
                operator: equal
                value: true
```

This check will only run on entities where `kind` is "component" **AND** `spec.lifecycle` is "production".

#### Multiple Filter Objects (OR logic)

You can provide an array of filter objects. The check will run if the entity matches **ANY** of the filter objects:

```yaml title="app-config.yaml"
techInsights:
  factChecker:
    checks:
      criticalEntitiesCheck:
        type: json-rules-engine
        name: Critical Entities Check
        description: Checks that apply to both APIs and production components
        factIds:
          - entityOwnershipFactRetriever
        filter:
          - kind: api
          - kind: component
            spec.lifecycle: production
        rule:
          conditions:
            all:
              - fact: hasGroupOwner
                operator: equal
                value: true
```

This check will run on entities that are either:

- APIs (any lifecycle), OR
- Components with production lifecycle

#### Array Values in Filter (OR logic for single field)

You can specify an array of values for a single field. The check will run if the entity's field matches **ANY** of the values:

```yaml title="app-config.yaml"
techInsights:
  factChecker:
    checks:
      multiKindCheck:
        type: json-rules-engine
        name: Multi-Kind Check
        description: Checks that apply to multiple entity kinds
        factIds:
          - entityOwnershipFactRetriever
        filter:
          kind: [component, api, system]
          spec.lifecycle: production
        rule:
          conditions:
            all:
              - fact: hasGroupOwner
                operator: equal
                value: true
```

This check will run on entities where `kind` is "component" **OR** "api" **OR** "system", **AND** `spec.lifecycle` is "production".

#### Matching Against Entity Arrays

Filters can also match values within entity array properties (e.g., tags):

```yaml title="app-config.yaml"
techInsights:
  factChecker:
    checks:
      backendServicesCheck:
        type: json-rules-engine
        name: Backend Services Check
        description: Checks for entities tagged as backend services
        factIds:
          - entityOwnershipFactRetriever
        filter:
          metadata.tags: backend
          spec.type: service
        rule:
          conditions:
            all:
              - fact: hasGroupOwner
                operator: equal
                value: true
```

This check will run on entities that have "backend" in their `metadata.tags` array **AND** `spec.type` is "service".

> **Note**: If the catalog (or auth) service is unavailable, or if entity fetching fails, checks that are configured with filters will run against all entities as a fallback to ensure checks continue to function. In this scenario, no filtering is applied.

## Custom operators

json-rules-engine supports a limited [number of built-in operators](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators) that can be used in conditions. You can add your own operators by adding them to the `operators` array in the `JsonRulesEngineFactCheckerFactory` constructor. For example:

```diff
+ import { Operator } from 'json-rules-engine';

const myFactCheckerFactory = new JsonRulesEngineFactCheckerFactory({
   checks: [],
   logger: env.logger,
+  operators: [ new Operator("startsWith", (a, b) => a.startsWith(b) ]
})
```

And you can then use it in your checks like this:

```js
...
rule: {
  conditions: {
    any: [
      {
        fact: 'version',
        operator: 'startsWith',
        value: '12',
      },
    ],
  },
}
```

## Configuring additional data store

This setup requires checks to be provided using the config.

By default, this implementation comes with an in-memory storage to store checks. You can inject an additional data store by adding an implementation of `TechInsightCheckRegistry` into the constructor options when creating a `JsonRulesEngineFactCheckerFactory`. That can be done as follows

```diff
 const myTechInsightCheckRegistry: TechInsightCheckRegistry<MyCheckType> = // snip
 const myFactCheckerFactory = new JsonRulesEngineFactCheckerFactory({
   checks: [],
   logger: env.logger,
+  checkRegistry: myTechInsightCheckRegistry
 }),

```
