# tech-insights

The tech insights plugin provides a way to define facts (data points) and checks (rules) that can be used to evaluate the state of an entity in the catalog.

## Plugins

- [tech-insights](./plugins/tech-insights/README.md) - The frontend plugin for tech insights
- [tech-insights-backend](./plugins/tech-insights-backend/README.md) - The backend plugin for tech insights.
- [tech-insights-backend-module-jsonfc](./plugins/tech-insights-backend-module-jsonfc/README.md) - A module that provides a `JsonRulesEngineFactChecker` fact checker for calculating boolean facts from JSON rules.
- [tech-insights-common](./plugins/tech-insights-common/README.md) - A common library containing shared utilities to be used across tech-insights plugins
- [tech-insights-node](./plugins/tech-insights-node/README.md) - A node library providing shared backend functionality for tech-insights plugins
- [tech-insights-react](./plugins/tech-insights-react/README.md) - A web library containing reusable frontend functionality (components, hooks, api, etc.) to create tech-insights views

## Local Development

To start the Backstage App, run:

```sh
yarn install
yarn start
```
