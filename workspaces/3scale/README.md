# Code Coverage

This workspace contains plugins for surfacing code coverage data on entity pages in Backstage. It ingests coverage reports (Cobertura, JaCoCo, or LCOV) for a component, normalizes them into a common format, and displays coverage summaries — plus history over time — directly in the catalog.

## Plugins

- [code-coverage](./plugins/code-coverage/README.md): Frontend plugin that displays code coverage summaries and history for an entity.
- [code-coverage-backend](./plugins/code-coverage-backend/README.md): Backend plugin that ingests Cobertura, JaCoCo, and LCOV coverage reports, standardizes them into a single JSON format, and exposes them via an API for the frontend to consume.

## Installation instructions

### Backend

Install the `code-coverage-backend` plugin by running the following in the root of your Backstage app:

```
yarn --cwd packages/backend add @backstage-community/plugin-code-coverage-backend
```

Then add it to your backend in `packages/backend/src/index.ts`:

```
backend.add(import('@backstage-community/plugin-code-coverage-backend'));
```

### Frontend

Install the `code-coverage` plugin by running the following in the root of your Backstage app:

```
yarn --cwd packages/app add @backstage-community/plugin-code-coverage
```

Then add the code coverage tab to your entity page in `packages/app/src/components/catalog/EntityPage.tsx`:

```
import { EntityCodeCoverageContent } from '@backstage-community/plugin-code-coverage';

// ...

<EntityLayout.Route path="/code-coverage" title="Code Coverage">
  <EntityCodeCoverageContent />
</EntityLayout.Route>
```

### Configuring your entity

To enable coverage ingestion for an entity, set the `backstage.io/code-coverage` annotation:

```
metadata:
  annotations:
    backstage.io/code-coverage: enabled
```

To only count files tracked in version control (useful for excluding generated files from the report), set the annotation to `scm-only` instead:

```
metadata:
  annotations:
    backstage.io/code-coverage: scm-only
```

Once configured, upload a coverage report to the backend's `/report` endpoint (supports Cobertura, JaCoCo, or LCOV formats). See the [code-coverage-backend README](./plugins/code-coverage-backend/README.md) for the full API reference and configuration options.