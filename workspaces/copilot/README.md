# GitHub Copilot

This workspace contains plugins for integrating GitHub Copilot with Backstage, complete with metrics and insights for members of your organization or enterprise.

The plugin now defaults to the V2 dashboard and the report-based GitHub Copilot metrics API. If you are upgrading an existing installation, start with the migration guide in `docs/copilot-v2-migration-guide.md`.

## Plugins

- [copilot](./plugins/copilot/README): Frontend plugin that provides the UI components and functionality.
- [copilot-common](./plugins/copilot-common/README): A common library containing shared types, permissions, and constants.
- [copilot-backend](./plugins/copilot-backend/README): Backend plugin that provides the API integration and database interactions.

## Migration Docs

- [Copilot V2 migration guide](./docs/copilot-v2-migration-guide.md)
- [V2 design and implementation plan](./docs/v2-design-and-implementation-plan.md)
