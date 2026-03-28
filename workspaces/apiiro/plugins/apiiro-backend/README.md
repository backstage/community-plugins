# Apiiro Backend Plugin for Backstage

The Apiiro backend plugin provides the server-side functionality for the Apiiro Backstage integration. This plugin is **required** for the frontend plugin to function and handles API communication with the Apiiro platform, data retrieval, and permission management.

## Features

- **API Integration**: Communicates with Apiiro platform to retrieve security metrics and risk data
- **Application View Support**: Provides API endpoints for application-level insights and metrics
- **Metrics View Management**: Supports conditional access control for displaying the metrics view for specific entities

> [!NOTE]
> The Application View features require the Backstage connector to be configured in Apiiro to function properly.

## Prerequisites

- Apiiro Access Token with at least read permissions
- Frontend plugin `@backstage-community/plugin-apiiro` installed

### Installation

From your Backstage root directory, install the Apiiro backend plugin:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-apiiro-backend
```

Then register the Apiiro backend plugin in `packages/backend/src/index.ts`:

```ts
backend.add(import('@backstage-community/plugin-apiiro-backend'));
```

### Apiiro annotations

To be able to use the Apiiro plugin you need to add the following annotations to any entities you want to use it with:

**For Component entities (repositories):**

```yaml
apiiro.com/repo-id: <apiiro-repo-key>
apiiro.com/allow-metrics-view: "true" or "false" (controls whether the Metrics view appears in the Component Apiiro tab and Apiiro widget)
```

**For System entities (applications):**

```yaml
apiiro.com/application-id: <apiiro-application-key>
apiiro.com/allow-metrics-view: "true" or "false" (controls whether the Metrics view and repository list appears in the System Apiiro tab and Apiiro widget)
```

Let's break this down:

- `<apiiro-repo-key>` is the key of your repository in Apiiro
- `<apiiro-application-key>` is the key of your application in Apiiro

Here's what that will look like in action:

```yaml
# Example catalog-info.yaml for Component entity
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-component
  annotations:
    apiiro.com/repo-id: my-repo-key
    apiiro.com/allow-metrics-view: 'true'
---
# Example catalog-info.yaml for System entity
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: my-application
  annotations:
    apiiro.com/application-id: my-application-key
    apiiro.com/allow-metrics-view: 'true'
```

## Automatically Adding Apiiro Annotations (Optional)

### Notes

- **Component annotation:** Values are derived from the `backstage.io/source-location` field. If this field is not present, Apiiro annotations will not be added.
- **System annotation:** Values are derived from the entity reference and entity UID. The Backstage connector must be configured in Apiiro for this to work properly.
- **Existing annotations:** If Apiiro annotations already exist on an entity, they take precedence and will not be overwritten.

### Step 1: Install the entity processor module

Install the Apiiro entity processor module in your backend:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-apiiro-entity-processor
```

### Step 2: Register the entity processor

Register the Apiiro entity processor in `packages/backend/src/index.ts`:

```ts
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-apiiro-entity-processor'
  ),
);
```

### Step 3: Configure entity-level Apiiro metric view restrictions (Optional)

Optionally, define a list of entities that should have restricted access to Apiiro metrics in your `app-config.yaml` or `app-config.production.yaml`:

```yaml
apiiro:
  accessToken: ${APIIRO_TOKEN}
  defaultAllowMetricsView: true
  enableApplicationsView: false
  # Optional configuration to allow or disallow metric views for specific entities
  # Only applicable for adding the annotation automatically using the catalog entity processor
  annotationControl:
    entityNames:
      - component:<namespace>/<entity-name>
      - system:<namespace>/<entity-name>
    exclude: true
```

**Configuration options:**

- `defaultAllowMetricsView`: Default value for allowing metrics view (default: `true`).
- `enableApplicationsView`: Enables application annotation processing for System entities (default: `false`). **Note:** Requires Backstage connector configured in Apiiro.
- `annotationControl`:
  - `entityNames`: List of entity references to control the metrics view access.
  - `exclude: true` → **blocklist mode** (allow all entities except those listed).
  - `exclude: false` → **allowlist mode** (deny all entities except those listed).

The `apiiro.com/allow-metrics-view` annotation and the above configuration
together determine whether a given entity can display metrics on Apiiro Tab and Apiiro Widget.
If you configure this list it will override the `defaultAllowMetricsView` configuration.

After the catalog processing interval elapses, the Apiiro annotations will be added or updated on the corresponding Backstage entities.

## Configure Default Risk Filters (Optional)

You can configure default filters for the Apiiro Risk Table. When configured, only the specified filter options will be available in the filter dropdowns and will be applied by default when fetching risks.

```yaml
apiiro:
  accessToken: ${APIIRO_TOKEN}
  defaultAllowMetricsView: true
  enableApplicationsView: false
  # Optional: Configure default risk filters for the Apiiro Risk Table
  defaultRiskFilters:
    RiskLevel:
      - Critical
      - High
    RiskInsight:
      - Internet exposed
      - Deployed
    RiskCategory:
      - SAST findings
      - Secrets
    Provider:
      - ApiiroSca
      - AkamaiApiSecurity
    PolicyTags:
      - Security Code Review
      - Compliance Review (PCI)
```

**Configuration options:**

- **RiskLevel**: Filter by risk severity. Provide display names (e.g., "Critical", "High", "Medium", "Low").
- **RiskInsight**: Filter by risk insights. Provide display names (e.g., "Internet exposed", "Deployed", "Fixable").
- **RiskCategory**: Filter by risk category. Provide display names (e.g., "SAST findings", "Secrets", "OSS security").
- **Provider**: Filter by source provider. Provide API supported values (e.g., "ApiiroSca", "AkamaiApiSecurity").
- **PolicyTags**: Filter by policy tags. Provide display names (e.g., "Security Code Review").

## Development

This plugin backend can be started in a standalone mode from directly in this package with `yarn start`. This is a limited setup that is most convenient when developing the plugin backend itself.

To run the entire project including the frontend, run `yarn start` from the workspace root directory.

## Links

- [Frontend Plugin Documentation](../apiiro/README.md)
- [Common Package Documentation](../apiiro-common/README.md)
