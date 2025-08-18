# @backstage-community/plugin-tech-insights-backend-module-jsonfc

## 0.6.1

### Patch Changes

- Updated dependencies [ba5bf7b]
  - @backstage-community/plugin-tech-insights-common@0.7.1
  - @backstage-community/plugin-tech-insights-node@2.5.1

## 0.6.0

### Minor Changes

- a01ae4e: Backstage version bump to v1.39.0

### Patch Changes

- 01640b2: Fixes import of `backstage-plugin-api`.
- Updated dependencies [d6411fe]
- Updated dependencies [a01ae4e]
  - @backstage-community/plugin-tech-insights-common@0.7.0
  - @backstage-community/plugin-tech-insights-node@2.5.0

## 0.5.1

### Patch Changes

- Updated dependencies [375612d]
- Updated dependencies [ac739ca]
  - @backstage-community/plugin-tech-insights-node@2.4.0
  - @backstage-community/plugin-tech-insights-common@0.6.0

## 0.5.0

### Minor Changes

- 6951c64: Fix handling not computed Fact references

  - does not throw an error when a fact is valid, but it is not computed for the entity (yet)

## 0.4.0

### Minor Changes

- e919e53: Backstage version bump to v1.35.1

### Patch Changes

- 353f022: Fixes an issue where optional links were not included when loading checks from app config
- c107e0f: Deprecates `TechInsightCheck` from the `tech-insights-node` library in favor of `Check` coming from the `tech-insights-common` library.

  With this change comes a refactor of `Check` from a type to an interface.

  The `TechInsightCheck` interface will be removed from the `tech-insights-node` plugin in it's next major release.

  Importing `Check` from `@backstage-community/plugin-tech-insights-common/client` has been deprecated in favor of importing directly from `@backstage-community/plugin-tech-insights-common`.

- Updated dependencies [f015469]
- Updated dependencies [e919e53]
- Updated dependencies [c107e0f]
  - @backstage-community/plugin-tech-insights-common@0.5.0
  - @backstage-community/plugin-tech-insights-node@2.3.0

## 0.3.1

### Patch Changes

- 4e5dcbc: Bump json-rules-engine to solve [CVE-2024-21534](https://github.com/backstage/backstage/issues/27386)

## 0.3.0

### Minor Changes

- 5abfb11: Backstage version bump to v1.34.2

### Patch Changes

- Updated dependencies [5abfb11]
  - @backstage-community/plugin-tech-insights-common@0.4.0
  - @backstage-community/plugin-tech-insights-node@2.2.0

## 0.2.1

### Patch Changes

- Updated dependencies [d9d9039]
  - @backstage-community/plugin-tech-insights-node@2.1.1

## 0.2.0

### Minor Changes

- 5289c38: Add metadata to TechInsightCheck

### Patch Changes

- Updated dependencies [5289c38]
  - @backstage-community/plugin-tech-insights-common@0.3.0
  - @backstage-community/plugin-tech-insights-node@2.1.0

## 0.1.61

### Patch Changes

- Updated dependencies [c3bbe0f]
  - @backstage-community/plugin-tech-insights-node@2.0.0

## 0.1.60

### Patch Changes

- Updated dependencies [331daba]
  - @backstage-community/plugin-tech-insights-common@0.2.21
  - @backstage-community/plugin-tech-insights-node@1.0.3

## 0.1.59

### Patch Changes

- 7a14237: Backstage version bump to v1.32.2
- Updated dependencies [7a14237]
  - @backstage-community/plugin-tech-insights-common@0.2.20
  - @backstage-community/plugin-tech-insights-node@1.0.2

## 0.1.58

### Patch Changes

- e516773: Remove usages of deprecated references and usage of @backstage/backend-common
- e516773: Backstage version bump to v1.31.1
- Updated dependencies [e516773]
- Updated dependencies [e516773]
  - @backstage-community/plugin-tech-insights-common@0.2.19
  - @backstage-community/plugin-tech-insights-node@1.0.1

## 0.1.57

### Patch Changes

- Updated dependencies [9871d0b]
  - @backstage-community/plugin-tech-insights-node@1.0.0

## 0.1.56

### Patch Changes

- 1d33996: Added links property for checks, to allow the UI to render links for users to click and get more information about individual checks, what they mean, how to adhere to them, etc.
- Updated dependencies [1d33996]
  - @backstage-community/plugin-tech-insights-common@0.2.18
  - @backstage-community/plugin-tech-insights-node@0.6.7

## 0.1.55

### Patch Changes

- Updated dependencies [a84eb44]
  - @backstage-community/plugin-tech-insights-common@0.2.17
  - @backstage-community/plugin-tech-insights-node@0.6.6

## 0.1.54

### Patch Changes

- 00d148d: Backstage version bump to v1.30.2
- Updated dependencies [00d148d]
  - @backstage-community/plugin-tech-insights-common@0.2.16
  - @backstage-community/plugin-tech-insights-node@0.6.5

## 0.1.53

### Patch Changes

- 7ac338c: Update Backstage to 1.29.1
  Remove usage of deprecated API endpoints except tokenManager
- 794cc8b: Fix api reports generated with the wrong name
  Update @backstage/cli to 0.26.11
  Add missing Backstage fields in `package.json`
- Updated dependencies [7ac338c]
- Updated dependencies [794cc8b]
  - @backstage-community/plugin-tech-insights-node@0.6.4
  - @backstage-community/plugin-tech-insights-common@0.2.15

## 0.1.52

### Patch Changes

- cbad35a: Updated dependencies.
- Updated dependencies [cbad35a]
  - @backstage-community/plugin-tech-insights-common@0.2.14
  - @backstage-community/plugin-tech-insights-node@0.6.3

## 0.1.51

### Patch Changes

- Updated dependencies [d4a8be1]
  - @backstage-community/plugin-tech-insights-node@0.6.2

## 0.1.50

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-tech-insights-common@0.2.13
  - @backstage-community/plugin-tech-insights-node@0.6.1

## 0.1.49

### Patch Changes

- d5a1fe1: Replaced winston logger with `LoggerService`
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage-community/plugin-tech-insights-node@0.6.0
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.49-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage-community/plugin-tech-insights-node@0.5.3-next.1
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.49-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.5.3-next.0

## 0.1.48

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage-community/plugin-tech-insights-node@0.5.2
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.47

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.5
  - @backstage-community/plugin-tech-insights-node@0.5.1
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.46

### Patch Changes

- 6ce8c0b: Fixes an invalid line in the schema that was causing AJV to complain.
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage-community/plugin-tech-insights-node@0.5.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.46-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.5.0-next.2

## 0.1.46-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage-community/plugin-tech-insights-node@0.5.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.45-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage-community/plugin-tech-insights-node@0.5.0-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.42

### Patch Changes

- 25cfb76: Add support for the new backend system.

  A new backend module for the tech-insights backend
  was added and exported as `default`.

  The module will register the `JsonRulesEngineFactCheckerFactory`
  as `FactCheckerFactory`, loading checks from the config.

  You can use it with the new backend system like

  ```ts title="packages/backend/src/index.ts"
  backend.add(
    import('@backstage-community/plugin-tech-insights-backend-module-jsonfc'),
  );
  ```

- bc72782: Support loading `TechInsightsJsonRuleCheck` instances from config.

  Uses the check `id` as key.

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

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage-community/plugin-tech-insights-node@0.4.16
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.42-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.3
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.42-next.2

### Patch Changes

- 25cfb76: Add support for the new backend system.

  A new backend module for the tech-insights backend
  was added and exported as `default`.

  The module will register the `JsonRulesEngineFactCheckerFactory`
  as `FactCheckerFactory`, loading checks from the config.

  You can use it with the new backend system like

  ```ts title="packages/backend/src/index.ts"
  backend.add(
    import('@backstage-community/plugin-tech-insights-backend-module-jsonfc'),
  );
  ```

- bc72782: Support loading `TechInsightsJsonRuleCheck` instances from config.

  Uses the check `id` as key.

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

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.42-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.1

## 0.1.42-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.0
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.41

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage-community/plugin-tech-insights-node@0.4.15
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.41-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.15-next.2

## 0.1.41-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.15-next.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.41-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.15-next.0
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.40

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage-community/plugin-tech-insights-node@0.4.14
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.40-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.3

## 0.1.40-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.2

## 0.1.40-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.1

## 0.1.40-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.39

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.13

## 0.1.39-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.13-next.2

## 0.1.39-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.13-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.39-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.13-next.0

## 0.1.38

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-node@0.4.12
  - @backstage/config@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.38-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/errors@1.2.3-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.12-next.2
  - @backstage/config@1.1.1-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.37-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.11-next.1
  - @backstage/config@1.1.0
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.1.37-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.11-next.0

## 0.1.35

### Patch Changes

- 51b801f743b2: Handle extracting facts from 'not' conditions too
- Updated dependencies
  - @backstage/backend-common@0.19.5
  - @backstage/config@1.1.0
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.9

## 0.1.35-next.3

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.2
  - @backstage/errors@1.2.2-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.12-next.0
  - @backstage/backend-common@0.19.5-next.3
  - @backstage-community/plugin-tech-insights-node@0.4.9-next.3

## 0.1.35-next.2

### Patch Changes

- 51b801f743b2: Handle extracting facts from 'not' conditions too
- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-common@0.19.5-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.9-next.2
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.1.35-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-common@0.19.5-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.9-next.1
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.1.34-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.8-next.0

## 0.1.32

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage-community/plugin-tech-insights-node@0.4.6
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.1.32-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.6-next.2

## 0.1.32-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.6-next.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.1.32-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.6-next.0

## 0.1.31

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1
  - @backstage/backend-common@0.19.1
  - @backstage/config@1.0.8
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.5

## 0.1.31-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.5-next.0

## 0.1.30

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/errors@1.2.0
  - @backstage-community/plugin-tech-insights-node@0.4.4
  - @backstage/config@1.0.8
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.1.30-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.2.0-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.4-next.2

## 0.1.30-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/errors@1.2.0-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.4-next.1
  - @backstage/config@1.0.7
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.1.30-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.4-next.0

## 0.1.29

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage-community/plugin-tech-insights-node@0.4.3
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.1.29-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.3-next.1
  - @backstage/config@1.0.7

## 0.1.29-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.3-next.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.1.28

### Patch Changes

- 9cb1db6546a: When multiple fact retrievers are used for a check, allow for cases where only one returns a given fact
- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage-community/plugin-tech-insights-node@0.4.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.1.28-next.2

### Patch Changes

- 9cb1db6546a: When multiple fact retrievers are used for a check, allow for cases where only one returns a given fact
- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.2-next.2

## 0.1.28-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.2-next.1

## 0.1.28-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.2-next.0

## 0.1.27

### Patch Changes

- 65454876fb2: Minor API report tweaks
- Updated dependencies
  - @backstage/backend-common@0.18.3
  - @backstage/errors@1.1.5
  - @backstage/config@1.0.7
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.1

## 0.1.27-next.2

### Patch Changes

- 65454876fb2: Minor API report tweaks
- Updated dependencies
  - @backstage/backend-common@0.18.3-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.1-next.2
  - @backstage/config@1.0.7-next.0

## 0.1.27-next.1

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.1.5-next.0
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/config@1.0.7-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.1-next.1

## 0.1.27-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.1-next.0

## 0.1.26

### Patch Changes

- d6b912f963: Surface the cause of the json rules engine
- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4

## 0.1.26-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.2
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-tech-insights-common@0.2.10-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.0-next.2

## 0.1.26-next.1

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-tech-insights-common@0.2.10-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.0-next.1
  - @backstage/backend-common@0.18.2-next.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4

## 0.1.26-next.0

### Patch Changes

- d6b912f963: Surface the cause of the json rules engine
- Updated dependencies
  - @backstage/backend-common@0.18.2-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.10-next.0

## 0.1.24

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-tech-insights-common@0.2.9
  - @backstage-community/plugin-tech-insights-node@0.3.8

## 0.1.24-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.8-next.1
  - @backstage/config@1.0.6-next.0
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-tech-insights-common@0.2.9

## 0.1.24-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.0
  - @backstage/config@1.0.6-next.0
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-tech-insights-common@0.2.9
  - @backstage-community/plugin-tech-insights-node@0.3.8-next.0

## 0.1.23

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0
  - @backstage/errors@1.1.4
  - @backstage/config@1.0.5
  - @backstage-community/plugin-tech-insights-common@0.2.9
  - @backstage-community/plugin-tech-insights-node@0.3.7

## 0.1.23-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.3
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.3

## 0.1.23-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.2
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.1.23-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.1.23-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.1-next.0
  - @backstage/config@1.0.5-next.0
  - @backstage/errors@1.1.4-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.0

## 0.1.22

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0
  - @backstage-community/plugin-tech-insights-node@0.3.6
  - @backstage/config@1.0.4
  - @backstage/errors@1.1.3
  - @backstage-community/plugin-tech-insights-common@0.2.8

## 0.1.22-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.6-next.1
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.8-next.0

## 0.1.22-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.6-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.8-next.0

## 0.1.21

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2
  - @backstage-community/plugin-tech-insights-node@0.3.5
  - @backstage/config@1.0.3
  - @backstage/errors@1.1.2
  - @backstage-community/plugin-tech-insights-common@0.2.7

## 0.1.21-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2-next.2
  - @backstage-community/plugin-tech-insights-node@0.3.5-next.2
  - @backstage/config@1.0.3-next.2
  - @backstage/errors@1.1.2-next.2
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.2

## 0.1.21-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2-next.1
  - @backstage/config@1.0.3-next.1
  - @backstage/errors@1.1.2-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.5-next.1

## 0.1.21-next.0

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-tech-insights-node@0.3.5-next.0
  - @backstage/backend-common@0.15.2-next.0
  - @backstage/config@1.0.3-next.0
  - @backstage/errors@1.1.2-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.0

## 0.1.20

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.1
  - @backstage-community/plugin-tech-insights-node@0.3.4
  - @backstage/config@1.0.2
  - @backstage/errors@1.1.1

## 0.1.20-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.0.2-next.0
  - @backstage/errors@1.1.1-next.0
  - @backstage/backend-common@0.15.1-next.3
  - @backstage-community/plugin-tech-insights-node@0.3.4-next.1

## 0.1.20-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.4-next.0

## 0.1.19

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0
  - @backstage-community/plugin-tech-insights-common@0.2.6
  - @backstage-community/plugin-tech-insights-node@0.3.3

## 0.1.19-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.6-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.3-next.0

## 0.1.18

### Patch Changes

- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1
  - @backstage-community/plugin-tech-insights-common@0.2.5
  - @backstage-community/plugin-tech-insights-node@0.3.2
  - @backstage/errors@1.1.0

## 0.1.18-next.2

### Patch Changes

- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.3
  - @backstage-community/plugin-tech-insights-common@0.2.5-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.2-next.1

## 0.1.18-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.1-next.1
  - @backstage/errors@1.1.0-next.0

## 0.1.18-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.2-next.0

## 0.1.17

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.0
  - @backstage-community/plugin-tech-insights-node@0.3.1

## 0.1.17-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.0-next.2
  - @backstage-community/plugin-tech-insights-node@0.3.1-next.1

## 0.1.17-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.6-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.1-next.0

## 0.1.16

### Patch Changes

- 58e2c46151: Updated usages of `buildTechInsightsContext` in README.
- Updated dependencies
  - @backstage/backend-common@0.13.3
  - @backstage-community/plugin-tech-insights-node@0.3.0
  - @backstage/config@1.0.1

## 0.1.16-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.2
  - @backstage/config@1.0.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.0-next.2

## 0.1.16-next.1

### Patch Changes

- 58e2c46151: Updated usages of `buildTechInsightsContext` in README.
- Updated dependencies
  - @backstage/backend-common@0.13.3-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.0-next.1

## 0.1.16-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.10-next.0

## 0.1.15

### Patch Changes

- e0a51384ac: build(deps): bump `ajv` from 7.0.3 to 8.10.0
- ab008a0988: Removes node-cron from tech-insights to utilize backend-tasks
- Updated dependencies
  - @backstage-community/plugin-tech-insights-node@0.2.9
  - @backstage/backend-common@0.13.2

## 0.1.15-next.1

### Patch Changes

- ab008a0988: Removes node-cron from tech-insights to utilize backend-tasks
- Updated dependencies
  - @backstage-community/plugin-tech-insights-node@0.2.9-next.1
  - @backstage/backend-common@0.13.2-next.1

## 0.1.15-next.0

### Patch Changes

- e0a51384ac: build(deps): bump `ajv` from 7.0.3 to 8.10.0
- Updated dependencies
  - @backstage/backend-common@0.13.2-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.9-next.0

## 0.1.14

### Patch Changes

- 89c7e47967: Minor README update
- Updated dependencies
  - @backstage/backend-common@0.13.1
  - @backstage/config@1.0.0
  - @backstage/errors@1.0.0
  - @backstage-community/plugin-tech-insights-common@0.2.4
  - @backstage-community/plugin-tech-insights-node@0.2.8

## 0.1.13

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0
  - @backstage-community/plugin-tech-insights-node@0.2.7

## 0.1.13-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.7-next.0

## 0.1.12

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.12.0
  - @backstage-community/plugin-tech-insights-node@0.2.6

## 0.1.11

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.11.0
  - @backstage-community/plugin-tech-insights-node@0.2.5

## 0.1.10

### Patch Changes

- Fix for the previous release with missing type declarations.
- Updated dependencies
  - @backstage/backend-common@0.10.9
  - @backstage/config@0.1.15
  - @backstage/errors@0.2.2
  - @backstage-community/plugin-tech-insights-common@0.2.3
  - @backstage-community/plugin-tech-insights-node@0.2.4

## 0.1.9

### Patch Changes

- c77c5c7eb6: Added `backstage.role` to `package.json`
- Updated dependencies
  - @backstage/backend-common@0.10.8
  - @backstage/errors@0.2.1
  - @backstage/config@0.1.14
  - @backstage-community/plugin-tech-insights-common@0.2.2
  - @backstage-community/plugin-tech-insights-node@0.2.3

## 0.1.8

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.7
  - @backstage-community/plugin-tech-insights-node@0.2.2

## 0.1.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.7-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.2-next.0

## 0.1.7

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6
  - @backstage-community/plugin-tech-insights-node@0.2.1

## 0.1.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.1-next.0

## 0.1.6

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4
  - @backstage/config@0.1.13
  - @backstage-community/plugin-tech-insights-node@0.2.0

## 0.1.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4-next.0
  - @backstage/config@0.1.13-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.0-next.0

## 0.1.5

### Patch Changes

- a60eb0f0dd: adding new operation to run checks for multiple entities in one request
- Updated dependencies
  - @backstage/config@0.1.12
  - @backstage/backend-common@0.10.3
  - @backstage-community/plugin-tech-insights-common@0.2.1
  - @backstage/errors@0.2.0

## 0.1.4

### Patch Changes

- 8d00dc427c: ability to add custom operators
- Updated dependencies
  - @backstage/backend-common@0.10.1

## 0.1.3

### Patch Changes

- 6ff4408fa6: RunChecks endpoint now handles missing retriever data in checks. Instead of
  showing server errors, the checks will be shown for checks whose retrievers have
  data, and a warning will be shown if no checks are returned.
- Updated dependencies
  - @backstage/backend-common@0.10.0
  - @backstage-community/plugin-tech-insights-node@0.1.2

## 0.1.2

### Patch Changes

- c6c8b8e53e: Minor fixes in Readme to make the examples more directly usable.
- Updated dependencies
  - @backstage-community/plugin-tech-insights-common@0.2.0
  - @backstage/backend-common@0.9.12
  - @backstage-community/plugin-tech-insights-node@0.1.1

## 0.1.1

### Patch Changes

- 2017de90da: Update README docs to use correct function/parameter names
- Updated dependencies
  - @backstage/errors@0.1.5
  - @backstage/backend-common@0.9.11
