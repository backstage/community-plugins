# code-coverage-backend

This is the backend part of the `code-coverage` plugin. It takes care of processing various coverage formats and standardizing them into a single json format, used by the frontend.

## Installation

The code coverage backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
+ backend.add(import('@backstage-community/plugin-code-coverage-backend'));
```

## Configuring your entity

In order to use this plugin, you must set the `backstage.io/code-coverage` annotation.

```yaml
metadata:
  annotations:
    backstage.io/code-coverage: enabled
```

There's a feature to only include files that are in VCS in the coverage report, this is helpful to not count generated files for example. To enable this set the `backstage.io/code-coverage` annotation to `scm-only`.

```yaml
metadata:
  annotations:
    backstage.io/code-coverage: scm-only
```

Note: It may be required to set the [`backstage.io/source-location` annotation](https://backstage.io/docs/features/software-catalog/well-known-annotations#backstageiosource-location), however this should generally not be needed.

## API

### Adding a Cobertura report

POST a Cobertura XML file to `/report`

Example:

```json
// curl -X POST -H "Content-Type:text/xml" -d @cobertura.xml "localhost:7007/api/code-coverage/report?entity=component:default/entity-name&coverageType=cobertura"
{
  "links": [
    {
      "href": "http://localhost:7007/api/code-coverage/report?entity=component:default/entity-name",
      "rel": "coverage"
    }
  ]
}
```

### Adding a JaCoCo report

POST a JaCoCo XML file to `/report`

Example:

```json
// curl -X POST -H "Content-Type:text/xml" -d @jacoco.xml "localhost:7007/api/code-coverage/report?entity=component:default/entity-name&coverageType=jacoco"
{
  "links": [
    {
      "href": "http://localhost:7007/api/code-coverage/report?entity=component:default/entity-name",
      "rel": "coverage"
    }
  ]
}
```

### Adding a LCOV report

POST a LCOV INFO file to `/report`

Example:

```json
// curl -X POST -H "Content-Type:text/plain" -d @coverage.info "localhost:7007/api/code-coverage/report?entity=component:default/entity-name&coverageType=lcov"
{
  "links": [
    {
      "href": "http://localhost:7007/api/code-coverage/report?entity=component:default/entity-name",
      "rel": "coverage"
    }
  ]
}
```

### Reading json coverage

GET `/report`

Example:

```json
// curl localhost:7007/api/code-coverage/report?entity=component:default/entity-name
{
  "aggregate": {
    "branch": {
      "available": 0,
      "covered": 0,
      "missed": 0,
      "percentage": 0
    },
    "line": {
      "available": 5,
      "covered": 4,
      "missed": 1,
      "percentage": 80
    }
  },
  "entity": {
    "kind": "Component",
    "name": "entity-name",
    "namespace": "default"
  },
  "files": [
    {
      "branchHits": {},
      "filename": "main.go",
      "lineHits": {
        "117": 12,
        "142": 8,
        "34": 8,
        "42": 0,
        "58": 6
      }
    }
  ]
}
```

### Coverage history

GET `/history`

Example

```json
// curl localhost:7007/api/code-coverage/history?entity=component:default/entity-name
{
  "entity": {
    "kind": "Component",
    "name": "entity-name",
    "namespace": "default"
  },
  "history": [
    {
      "branch": {
        "available": 0,
        "covered": 0,
        "missed": 0,
        "percentage": 0
      },
      "line": {
        "available": 299,
        "covered": 116,
        "missed": 183,
        "percentage": 38.8
      },
      "timestamp": 1615490766141
    },
    {
      "branch": {
        "available": 0,
        "covered": 0,
        "missed": 0,
        "percentage": 0
      },
      "line": {
        "available": 299,
        "covered": 116,
        "missed": 183,
        "percentage": 38.8
      },
      "timestamp": 1615406307929
    }
  ]
}
```

### Configuration

Configure the plugin in your `app-config.yaml`:

```yaml
codeCoverage:
  bodySizeLimit: 100kb # Defaults to 100kb, see https://www.npmjs.com/package/body-parser#limit
```
