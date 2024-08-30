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
