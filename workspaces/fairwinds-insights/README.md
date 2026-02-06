# GitHub Fairwinds Insights

This workspace contains plugins for integrating GitHub Fairwinds Insights with Backstage, complete with metrics and insights for members of your organization or enterprise.

## Start dev environment

Create `app-config.local.yaml` with Fairwinds Insights configuration

```yaml
fairwindsInsights:
  apiUrl: ${FAIRWINDS_INSIGHTS_URL}
  organization: ${FAIRWINDS_INSIGHTS_ORGANIZATION}
  apiKey: ${FAIRWINDS_INSIGHTS_ORGANIZATION_TOKEN}
  cacheTTL: ${FAIRWINDS_INSIGHTS_ORGANIZATION_TOKEN}
```

To start the app, run:

Make sure you have yarn 4.X installed

```sh
yarn --version
```

```sh
yarn install && yarn start
```

## Plugins

- [fairwinds-insights](./plugins/fairwinds-insights/README): Frontend plugin that provides the UI components and functionality.
- [fairwinds-insights-common](./plugins/fairwinds-insights-common/README): A common library containing shared types, permissions, and constants.
- [fairwinds-insights-backend](./plugins/fairwinds-insights-backend/README): Backend plugin that provides the API integration and database interactions.
