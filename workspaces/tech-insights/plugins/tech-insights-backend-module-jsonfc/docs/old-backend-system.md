# Tech Insights Backend JSON Rules engine fact checker module (old backend system)

**Note**: These instructions are for the old backend system. The root [README](../README.md) has instructions for the new system.

---

This is an extension to module to tech-insights-backend plugin, which provides basic framework and functionality to implement tech insights within Backstage.

This module provides functionality to run checks against a [json-rules-engine](https://github.com/CacheControl/json-rules-engine) and provide boolean logic by simply building checks using JSON conditions.

## Getting started

To add this FactChecker into your Tech Insights you need to install the module into your backend application:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-tech-insights-backend-module-jsonfc
```

This setup requires checks to be provided using the config.

### Add to the backend (old backend system)

Modify the `techInsights.ts` file to contain a reference to the FactCheckers implementation.

```diff
+import { JsonRulesEngineFactCheckerFactory } from '@backstage-community/plugin-tech-insights-backend-module-jsonfc';

+const myFactCheckerFactory = new JsonRulesEngineFactCheckerFactory({
+   checks: [],
+   logger: env.logger,
+}),

 const builder = buildTechInsightsContext({
   logger: env.logger,
   config: env.config,
   database: env.database,
   discovery: env.discovery,
   tokenManager: env.tokenManager,
   factRetrievers: [myFactRetrieverRegistration],
+  factCheckerFactory: myFactCheckerFactory
 });
```

## Configuring additional data store

By default, this implementation comes with an in-memory storage to store checks. You can inject an additional data store by adding an implementation of `TechInsightCheckRegistry` into the constructor options when creating a `JsonRulesEngineFactCheckerFactory`. That can be done as follows

```diff
 const myTechInsightCheckRegistry: TechInsightCheckRegistry<MyCheckType> = // snip
 const myFactCheckerFactory = new JsonRulesEngineFactCheckerFactory({
   checks: [],
   logger: env.logger,
+  checkRegistry: myTechInsightCheckRegistry
 }),

```

## Adding checks in code (old backend system)

Checks for this FactChecker are constructed as [`json-rules-engine` compatible JSON rules](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#conditions). A check could look like the following for example:

```ts
import {
  JSON_RULE_ENGINE_CHECK_TYPE,
  TechInsightJsonRuleCheck,
} from '@backstage-community/plugin-tech-insights-backend-module-jsonfc';

export const exampleCheck: TechInsightJsonRuleCheck = {
  id: 'demodatacheck', // Unique identifier of this check
  name: 'demodatacheck', // A human readable name of this check to be displayed in the UI
  type: JSON_RULE_ENGINE_CHECK_TYPE, // Type identifier of the check. Used to run logic against, determine persistence option to use and render correct components on the UI
  description: 'A fact check for demoing purposes', // A description to be displayed in the UI
  factIds: ['documentation-number-factretriever'], // References to fact ids that this check uses. See documentation on FactRetrievers for more information on these
  rule: {
    // The actual rule
    conditions: {
      all: [
        // 2 options are available, all and any conditions.
        {
          fact: 'examplenumberfact', // Reference to an individual fact to check against
          operator: 'greaterThanInclusive', // Operator to use. See: https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators for more
          value: 2, // The threshold value that the fact must satisfy
        },
      ],
    },
  },
  successMetadata: {
    // Additional metadata to be returned if the check has passed
    link: 'https://link.to.some.information.com',
  },
  failureMetadata: {
    // Additional metadata to be returned if the check has failed
    link: 'https://sonar.mysonarqube.com/increasing-number-value',
  },
};
```

## Custom operators (old backend system)

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
