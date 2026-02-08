# Setup

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @backstage-community/plugin-grafana
```

Configure the plugin in `app-config.yaml`. The proxy endpoint described below will allow the frontend
to authenticate with Grafana without exposing your API key to users.
[Create an API key](https://grafana.com/docs/grafana/latest/http_api/auth/#create-api-token) if you don't already have one. `Viewer` access will be enough.

## Single instance configuration

```yaml
# app-config.yaml
proxy:
  '/grafana/api':
    # May be a public or an internal DNS
    target: https://grafana.host/
    headers:
      Authorization: Bearer ${GRAFANA_TOKEN}

grafana:
  # Publicly accessible domain
  domain: https://monitoring.company.com

  # Is unified alerting enabled in Grafana?
  # See: https://grafana.com/blog/2021/06/14/the-new-unified-alerting-system-for-grafana-everything-you-need-to-know/
  # Optional. Default: false
  unifiedAlerting: false

  # How many pages of Grafana Dashboard search results to check for dashboards?
  # Optional. Default: 1
  grafanaDashboardMaxPages: 1

  # What limit value to pass for each query to the Grafana Dashboard search endpoint?
  # Optional. Default: 1000; Max: 5000 (upstream limit)
  grafanaDashboardSearchLimit: 1000
```

Integrators with 1000-5000 Grafana dashboards should prefer raising the
`grafanaDashboardSearchLimit` setting before raising
`grafanaDashboardMaxPages`; as Grafana caches the underlying dashboard listing
endpoint heavily.

## Multiple instances configuration

If your organization has multiple Grafana instances, you can configure them all under the `hosts` key:

```yaml
# app-config.yaml
proxy:
  '/grafana/production/api':
    target: https://grafana-prod.host/
    headers:
      Authorization: Bearer ${GRAFANA_PROD_TOKEN}
  '/grafana/staging/api':
    target: https://grafana-staging.host/
    headers:
      Authorization: Bearer ${GRAFANA_STAGING_TOKEN}

grafana:
  hosts:
    - id: production
      domain: https://monitoring-prod.company.com
      proxyPath: /grafana/production/api
      unifiedAlerting: true
    - id: staging
      domain: https://monitoring-staging.company.com
      proxyPath: /grafana/staging/api
      unifiedAlerting: false
```

Each host entry supports the same options as the single instance configuration (`domain`, `proxyPath`, `unifiedAlerting`, `grafanaDashboardSearchLimit`, `grafanaDashboardMaxPages`), plus a required `id` field that uniquely identifies the instance.

To associate an entity with a specific Grafana instance, add the `grafana/source-id` annotation to your entity's `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    grafana/source-id: production
    grafana/dashboard-selector: my-service
    grafana/alert-label-selector: service=my-service
```

If the `grafana/source-id` annotation is not set, the plugin will use the first configured host (or the `default` host created from the legacy `domain` config).

Note: the single instance (`domain`) and multiple instances (`hosts`) configurations can coexist. When both are defined, the single instance is added as a host with `id: default`.

## Expose the plugin

Expose the plugin to Backstage:

```ts
// packages/app/src/plugins.tsx

// other plugins...

export { grafanaPlugin } from '@backstage-community/plugin-grafana';
```

That's it! You can now update your entities pages to [display alerts](alerts-on-component-page.md) or [dashboards](dashboards-on-component-page.md) related to them.
