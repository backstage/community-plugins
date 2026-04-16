# @backstage-community/plugin-catalog-backend-module-apiiro-entity-processor

Catalog backend module that automatically adds Apiiro annotations to Backstage entities based on their `backstage.io/source-location`. It is used together with the Apiiro frontend and backend plugins to simplify onboarding and keep Apiiro-related annotations consistent.

## Overview

When enabled, this module:

- Derives the Apiiro repository identifier from the entity's source location (for Component entities).
- Derives the Apiiro application identifier from the entity's reference and uid (for System entities, when applications view is enabled).
- Adds the following annotations when they are missing:
  - `apiiro.com/repo-id` (for Component entities)
  - `apiiro.com/application-id` (for System entities)
  - `apiiro.com/allow-metrics-view`
- **Does not overwrite** existing Apiiro annotations if they are already set on the entity.

> [!NOTE]
> Application annotation support requires the Backstage connector to be configured in Apiiro and `enableApplicationsView` to be set to `true` in the configuration.

This helps you avoid manually managing Apiiro annotations on every entity in your catalog.

## Installation

From your Backstage root directory, install the module in the backend:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-apiiro-entity-processor
```

## Usage

### 1. Register the entity processor

In `packages/backend/src/index.ts`, register the module with the backend:

```ts
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-apiiro-entity-processor'
  ),
);
```

After the catalog processing interval elapses, entities that have a valid `backstage.io/source-location`
will be updated with Apiiro annotations when they are missing.

### 2. Apiiro annotations

The processor works with the following annotations:

**For Component entities (repositories):**

- `apiiro.com/repo-id`: `<repo-key>`
- `apiiro.com/allow-metrics-view`: `"true"` or `"false"` (controls whether the Metrics view appears in the Component Apiiro tab and Apiiro widget)

**For System entities (applications):**

- `apiiro.com/application-id`: `<application-key>`
- `apiiro.com/allow-metrics-view`: `"true"` or `"false"` (controls whether the Metrics view and repository list appears in the System Apiiro tab and Apiiro widget)

### Notes

- For Component entities, annotation values are derived from the value of `backstage.io/source-location`. If `backstage.io/source-location` is not present, Apiiro annotations will not be added.
- For System entities, the application identifier is derived from the entity reference and entity uid and matched against applications in Apiiro (requires `enableApplicationsView: true`).
- If Apiiro annotations already exist on an entity, they take precedence and will **not** be overwritten.

## Permissions and Metrics View

Together with the Apiiro backend plugin configuration, you can further restrict
which entities are allowed to show Apiiro metrics (tiles / dashboards) and
widgets. In `app-config.yaml` or `app-config.production.yaml`:

```yaml
apiiro:
  accessToken: ${APIIRO_TOKEN}
  defaultAllowMetricsView: true
  enableApplicationsView: false
  # Optional configuration to allow or disallow metric views for specific entities
  annotationControl:
    entityNames:
      - component:<namespace>/<entity-name>
      - system:<namespace>/<entity-name>
    exclude: true
```

Where the configuration parameters are:

- `defaultAllowMetricsView`: Default value for allowing metrics view (default: `true`).
- `enableApplicationsView`: Enables application annotation processing for System entities (default: `false`). **Note:** Requires Backstage connector configured in Apiiro.
- `annotationControl`:
  - `entityNames`: List of entity references to control the metrics view access.
  - `exclude: true` → **blocklist mode** (allow all entities except those listed).
  - `exclude: false` → **allowlist mode** (deny all entities except those listed).

The `apiiro.com/allow-metrics-view` annotation and the above configuration
together determine whether a given entity can display metrics on Apiiro Tab and Apiiro Widget.
If you configure this list it will override the `defaultAllowMetricsView` configuration.

## High-Level Design

### Architecture Overview

The Apiiro Entity Processor is a catalog backend module that automatically enriches Backstage entities with Apiiro-specific annotations. The processor operates during catalog processing cycles and integrates with external Apiiro services to maintain consistent security metadata across your software ecosystem.

### Core Components

1. **ApiiroAnnotationProcessor**: Main catalog processor that handles entity annotation logic
2. **CacheManager**: Manages persistent caching of Apiiro data using Backstage's CacheService
3. **ApiiroApiClient**: Handles communication with Apiiro's REST APIs
4. **Entity Reference Resolution**: Maps Backstage entity references to Apiiro application identifiers

### Caching Strategy

#### Why CacheService (Persistent Caching)?

This implementation uses **Backstage's CacheService** for persistent data storage across multiple catalog runs. This decision is based on catalog module best practices and performance optimization requirements:

**Benefits of CacheService:**

- **Performance Optimization**: Reduces expensive external API calls to Apiiro (repository and application data)
- **Rate Limit Compliance**: Respects Apiiro API rate limits by minimizing requests
- **System Reliability**: Cached data provides resilience against network failures
- **Scalability**: Handles growing entity counts without degrading performance
- **Cross-Run Efficiency**: Multiple catalog runs (every refresh rate) reuse the same cached data

**Cached Data Types:**

- **Repository Mappings**: URL to Apiiro repository key mappings (1-hour TTL)
- **Application Mappings**: Entity UID to Apiiro application key mappings (1-hour TTL)
- **Entity References**: System entity reference to UID mappings (1-hour TTL)

### Data Flow

1. **Catalog Processing Trigger**: Backstage catalog runs every refresh rate (default: 5 minutes)
2. **Cache Check**: Processor checks CacheService for existing Apiiro data
3. **API Integration**: Fetches fresh data from Apiiro only when cache expires (1-hour TTL)
4. **Entity Processing**: Enriches entities with appropriate Apiiro annotations
5. **Cache Update**: Refreshes persistent cache with new data when needed

### Integration Points

- **Backstage Catalog**: Processes entities during standard catalog refresh cycles
- **Apiiro Repository API**: Maps source locations to repository identifiers
- **Apiiro Application API**: Maps system entities to application identifiers
- **Backstage Catalog API**: Resolves entity references to UIDs for system entity mapping

This design follows catalog module best practices by prioritizing performance, reliability, and efficient resource utilization while maintaining data freshness appropriate for security metadata.

## Development

This module is developed as part of the Apiiro Backstage integration.
See the root repository `README.md` and the Apiiro backend plugin README for
more details on local development and configuration.
